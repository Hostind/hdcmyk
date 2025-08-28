/**
 * Performance Optimizations
 * Provides performance enhancements for large datasets and real-time updates
 */

class PerformanceOptimizationManager {
    constructor() {
        this.cache = new Map();
        this.observers = new Map();
        this.throttleTimers = new Map();
        this.debounceTimers = new Map();
        this.requestAnimationFrameIds = new Map();
        this.workerPool = [];
        this.maxCacheSize = 1000;
        this.performanceMetrics = {
            calculations: [],
            renders: [],
            fileOperations: []
        };
        this.init();
    }

    init() {
        this.setupWebWorkers();
        this.setupIntersectionObserver();
        this.setupResizeObserver();
        this.setupMemoryManagement();
        this.setupPerformanceMonitoring();
        this.optimizeDOM();
        this.setupLazyLoading();
        console.log('Performance optimization manager initialized');
    }

    setupWebWorkers() {
        // Check if Web Workers are supported
        if (typeof Worker !== 'undefined') {
            try {
                // Create worker for color calculations
                const colorWorkerCode = `
                    // Color calculation worker
                    self.onmessage = function(e) {
                        const { type, data, id } = e.data;
                        
                        try {
                            let result;
                            
                            switch(type) {
                                case 'deltaE':
                                    result = calculateDeltaE(data.target, data.sample, data.method);
                                    break;
                                case 'batchDeltaE':
                                    result = calculateBatchDeltaE(data.targets, data.samples, data.method);
                                    break;
                                case 'colorConversion':
                                    result = convertColor(data.from, data.to, data.values);
                                    break;
                                case 'matrixCalculation':
                                    result = calculateCCMMatrix(data.targets, data.samples);
                                    break;
                                default:
                                    throw new Error('Unknown calculation type');
                            }
                            
                            self.postMessage({ id, result, success: true });
                        } catch (error) {
                            self.postMessage({ id, error: error.message, success: false });
                        }
                    };
                    
                    function calculateDeltaE(target, sample, method = 'DE2000') {
                        // Simplified Delta E calculation for worker
                        const dL = target.l - sample.l;
                        const da = target.a - sample.a;
                        const db = target.b - sample.b;
                        
                        switch(method) {
                            case 'DE76':
                                return Math.sqrt(dL * dL + da * da + db * db);
                            case 'DE94':
                                // Simplified DE94 calculation
                                const kL = 1, kC = 1, kH = 1;
                                const C1 = Math.sqrt(target.a * target.a + target.b * target.b);
                                const C2 = Math.sqrt(sample.a * sample.a + sample.b * sample.b);
                                const dC = C1 - C2;
                                const dH2 = da * da + db * db - dC * dC;
                                const dH = dH2 > 0 ? Math.sqrt(dH2) : 0;
                                const sL = 1;
                                const sC = 1 + 0.045 * C1;
                                const sH = 1 + 0.015 * C1;
                                return Math.sqrt(
                                    Math.pow(dL / (kL * sL), 2) +
                                    Math.pow(dC / (kC * sC), 2) +
                                    Math.pow(dH / (kH * sH), 2)
                                );
                            case 'DE2000':
                            default:
                                // Simplified DE2000 - full implementation would be more complex
                                return Math.sqrt(dL * dL + da * da + db * db);
                        }
                    }
                    
                    function calculateBatchDeltaE(targets, samples, method) {
                        const results = [];
                        for (let i = 0; i < Math.min(targets.length, samples.length); i++) {
                            results.push(calculateDeltaE(targets[i], samples[i], method));
                        }
                        return results;
                    }
                    
                    function convertColor(fromSpace, toSpace, values) {
                        // Simplified color conversion
                        if (fromSpace === 'lab' && toSpace === 'rgb') {
                            return labToRgb(values);
                        }
                        return values;
                    }
                    
                    function labToRgb(lab) {
                        // Simplified LAB to RGB conversion
                        const [l, a, b] = lab;
                        // This is a very simplified conversion - real implementation would be more accurate
                        const r = Math.max(0, Math.min(255, l * 2.55 + a * 1.28));
                        const g = Math.max(0, Math.min(255, l * 2.55 - a * 0.64 - b * 0.32));
                        const bl = Math.max(0, Math.min(255, l * 2.55 + b * 1.28));
                        return [Math.round(r), Math.round(g), Math.round(bl)];
                    }
                    
                    function calculateCCMMatrix(targets, samples) {
                        // Simplified CCM calculation
                        if (targets.length !== samples.length || targets.length < 3) {
                            throw new Error('Insufficient data for CCM calculation');
                        }
                        
                        // Return identity matrix as placeholder
                        return [
                            [1, 0, 0],
                            [0, 1, 0],
                            [0, 0, 1]
                        ];
                    }
                `;

                const blob = new Blob([colorWorkerCode], { type: 'application/javascript' });
                const workerUrl = URL.createObjectURL(blob);
                
                // Create multiple workers for parallel processing
                for (let i = 0; i < Math.min(4, navigator.hardwareConcurrency || 2); i++) {
                    const worker = new Worker(workerUrl);
                    worker.busy = false;
                    worker.id = i;
                    this.workerPool.push(worker);
                }

                console.log(`Created ${this.workerPool.length} web workers for color calculations`);
            } catch (error) {
                console.warn('Failed to create web workers:', error);
            }
        }
    }

    getAvailableWorker() {
        return this.workerPool.find(worker => !worker.busy);
    }

    executeInWorker(type, data) {
        return new Promise((resolve, reject) => {
            const worker = this.getAvailableWorker();
            
            if (!worker) {
                // Fallback to main thread if no workers available
                reject(new Error('No workers available'));
                return;
            }

            const id = Date.now() + Math.random();
            worker.busy = true;

            const timeout = setTimeout(() => {
                worker.busy = false;
                reject(new Error('Worker timeout'));
            }, 10000); // 10 second timeout

            worker.onmessage = (e) => {
                clearTimeout(timeout);
                worker.busy = false;
                
                if (e.data.id === id) {
                    if (e.data.success) {
                        resolve(e.data.result);
                    } else {
                        reject(new Error(e.data.error));
                    }
                }
            };

            worker.postMessage({ type, data, id });
        });
    }

    setupIntersectionObserver() {
        // Optimize rendering of elements that are not visible
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-viewport');
                        this.enableUpdates(entry.target);
                    } else {
                        entry.target.classList.remove('in-viewport');
                        this.disableUpdates(entry.target);
                    }
                });
            }, {
                rootMargin: '50px',
                threshold: 0.1
            });

            // Observe expensive components
            const expensiveElements = document.querySelectorAll(
                '.heatmap-canvas, .grid-container, .color-swatch, .results-section'
            );
            
            expensiveElements.forEach(element => {
                observer.observe(element);
            });

            this.observers.set('intersection', observer);
        }
    }

    setupResizeObserver() {
        // Optimize layout recalculations
        if ('ResizeObserver' in window) {
            const observer = new ResizeObserver(entries => {
                this.throttle('resize', () => {
                    entries.forEach(entry => {
                        this.handleResize(entry.target, entry.contentRect);
                    });
                }, 100);
            });

            // Observe containers that might need layout updates
            const containers = document.querySelectorAll(
                '.calculator-container, .grid-container, .heatmap-container'
            );
            
            containers.forEach(container => {
                observer.observe(container);
            });

            this.observers.set('resize', observer);
        }
    }

    handleResize(element, rect) {
        // Optimize canvas elements on resize
        if (element.tagName === 'CANVAS') {
            this.optimizeCanvas(element, rect);
        }

        // Update grid layouts
        if (element.classList.contains('grid-container')) {
            this.optimizeGridLayout(element, rect);
        }
    }

    optimizeCanvas(canvas, rect) {
        // Use device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = rect.width;
        const displayHeight = rect.height;

        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
    }

    optimizeGridLayout(container, rect) {
        // Optimize grid cell size based on container size
        const cells = container.querySelectorAll('.grid-cell');
        const optimalCellSize = Math.floor(Math.min(rect.width, rect.height) / 10);
        
        cells.forEach(cell => {
            cell.style.width = optimalCellSize + 'px';
            cell.style.height = optimalCellSize + 'px';
        });
    }

    setupMemoryManagement() {
        // Implement cache with LRU eviction
        this.setupLRUCache();

        // Monitor memory usage
        this.monitorMemoryUsage();

        // Clean up unused resources
        this.setupResourceCleanup();
    }

    setupLRUCache() {
        const originalSet = this.cache.set.bind(this.cache);
        const originalGet = this.cache.get.bind(this.cache);

        this.cache.set = (key, value) => {
            // Remove oldest entries if cache is full
            if (this.cache.size >= this.maxCacheSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            
            return originalSet(key, value);
        };

        this.cache.get = (key) => {
            const value = originalGet(key);
            if (value !== undefined) {
                // Move to end (most recently used)
                this.cache.delete(key);
                this.cache.set(key, value);
            }
            return value;
        };
    }

    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                const usagePercent = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
                
                if (usagePercent > 80) {
                    console.warn('High memory usage detected:', usagePercent.toFixed(2) + '%');
                    this.performGarbageCollection();
                }
            }, 30000); // Check every 30 seconds
        }
    }

    performGarbageCollection() {
        // Clear old cache entries
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5 minutes

        for (const [key, value] of this.cache.entries()) {
            if (value.timestamp && (now - value.timestamp) > maxAge) {
                this.cache.delete(key);
            }
        }

        // Clear old performance metrics
        this.performanceMetrics.calculations = this.performanceMetrics.calculations.slice(-100);
        this.performanceMetrics.renders = this.performanceMetrics.renders.slice(-100);
        this.performanceMetrics.fileOperations = this.performanceMetrics.fileOperations.slice(-50);

        console.log('Garbage collection performed');
    }

    setupResourceCleanup() {
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // Clean up on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseExpensiveOperations();
            } else {
                this.resumeExpensiveOperations();
            }
        });
    }

    setupPerformanceMonitoring() {
        // Monitor calculation performance
        this.wrapFunction('calculateDeltaE', (originalFn, ...args) => {
            const start = performance.now();
            const result = originalFn.apply(this, args);
            const duration = performance.now() - start;
            
            this.performanceMetrics.calculations.push({
                duration,
                timestamp: Date.now(),
                args: args.length
            });
            
            return result;
        });

        // Monitor render performance
        this.monitorRenderPerformance();

        // Report performance metrics periodically
        setInterval(() => {
            this.reportPerformanceMetrics();
        }, 60000); // Every minute
    }

    wrapFunction(functionName, wrapper) {
        if (window[functionName]) {
            const originalFn = window[functionName];
            window[functionName] = (...args) => wrapper(originalFn, ...args);
        }
    }

    monitorRenderPerformance() {
        let frameCount = 0;
        let lastTime = performance.now();

        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                this.performanceMetrics.renders.push({
                    fps,
                    timestamp: Date.now()
                });
                
                if (fps < 30) {
                    console.warn('Low FPS detected:', fps);
                    this.optimizeRendering();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);
    }

    optimizeRendering() {
        // Reduce animation complexity
        document.body.classList.add('performance-mode');
        
        // Disable expensive visual effects temporarily
        const expensiveElements = document.querySelectorAll('.color-swatch, .heatmap-canvas');
        expensiveElements.forEach(element => {
            element.classList.add('reduced-effects');
        });

        // Re-enable after a delay
        setTimeout(() => {
            document.body.classList.remove('performance-mode');
            expensiveElements.forEach(element => {
                element.classList.remove('reduced-effects');
            });
        }, 5000);
    }

    optimizeDOM() {
        // Use document fragments for batch DOM operations
        this.setupDocumentFragments();

        // Optimize event listeners
        this.optimizeEventListeners();

        // Minimize reflows and repaints
        this.minimizeLayoutThrashing();
    }

    setupDocumentFragments() {
        // Create reusable document fragment
        this.documentFragment = document.createDocumentFragment();
    }

    optimizeEventListeners() {
        // Use event delegation for dynamic content
        document.addEventListener('click', this.handleDelegatedClick.bind(this));
        document.addEventListener('input', this.handleDelegatedInput.bind(this));
        document.addEventListener('change', this.handleDelegatedChange.bind(this));
    }

    handleDelegatedClick(event) {
        const target = event.target;
        
        // Handle grid cell clicks
        if (target.classList.contains('grid-cell')) {
            this.throttle('grid-click', () => {
                this.handleGridCellClick(target);
            }, 100);
        }
        
        // Handle color swatch clicks
        if (target.classList.contains('color-swatch')) {
            this.throttle('swatch-click', () => {
                this.handleColorSwatchClick(target);
            }, 100);
        }
    }

    handleDelegatedInput(event) {
        const target = event.target;
        
        // Handle color input changes
        if (target.matches('[id*="target-"], [id*="sample-"]')) {
            this.debounce('color-input', () => {
                this.handleColorInputChange(target);
            }, 300);
        }
    }

    handleDelegatedChange(event) {
        const target = event.target;
        
        // Handle file inputs
        if (target.type === 'file') {
            this.handleFileInputChange(target);
        }
    }

    minimizeLayoutThrashing() {
        // Batch DOM reads and writes
        this.setupBatchedDOMOperations();
    }

    setupBatchedDOMOperations() {
        this.domReadQueue = [];
        this.domWriteQueue = [];
        this.batchScheduled = false;

        this.batchDOMOperations = () => {
            // Perform all reads first
            const readResults = this.domReadQueue.map(operation => operation());
            this.domReadQueue = [];

            // Then perform all writes
            this.domWriteQueue.forEach((operation, index) => {
                operation(readResults[index]);
            });
            this.domWriteQueue = [];

            this.batchScheduled = false;
        };
    }

    batchDOMRead(operation) {
        this.domReadQueue.push(operation);
        this.scheduleBatch();
    }

    batchDOMWrite(operation) {
        this.domWriteQueue.push(operation);
        this.scheduleBatch();
    }

    scheduleBatch() {
        if (!this.batchScheduled) {
            this.batchScheduled = true;
            requestAnimationFrame(this.batchDOMOperations);
        }
    }

    setupLazyLoading() {
        // Lazy load heavy components
        this.setupComponentLazyLoading();

        // Lazy load images and media
        this.setupMediaLazyLoading();
    }

    setupComponentLazyLoading() {
        const lazyComponents = document.querySelectorAll('[data-lazy-component]');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadComponent(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            });

            lazyComponents.forEach(component => {
                observer.observe(component);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            lazyComponents.forEach(component => {
                this.loadComponent(component);
            });
        }
    }

    loadComponent(element) {
        const componentType = element.getAttribute('data-lazy-component');
        
        switch (componentType) {
            case 'heatmap':
                this.loadHeatmapComponent(element);
                break;
            case 'grid':
                this.loadGridComponent(element);
                break;
            case 'history':
                this.loadHistoryComponent(element);
                break;
        }
    }

    setupMediaLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.getAttribute('data-src');
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // Utility methods
    throttle(key, func, delay) {
        if (this.throttleTimers.has(key)) {
            return;
        }

        this.throttleTimers.set(key, setTimeout(() => {
            func();
            this.throttleTimers.delete(key);
        }, delay));
    }

    debounce(key, func, delay) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }

        this.debounceTimers.set(key, setTimeout(() => {
            func();
            this.debounceTimers.delete(key);
        }, delay));
    }

    requestAnimationFrameThrottle(key, func) {
        if (this.requestAnimationFrameIds.has(key)) {
            return;
        }

        const id = requestAnimationFrame(() => {
            func();
            this.requestAnimationFrameIds.delete(key);
        });

        this.requestAnimationFrameIds.set(key, id);
    }

    // Cache methods
    getCached(key) {
        return this.cache.get(key);
    }

    setCached(key, value, ttl = 300000) { // 5 minutes default TTL
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
    }

    isCacheValid(key) {
        const cached = this.cache.get(key);
        if (!cached) return false;
        
        const now = Date.now();
        return (now - cached.timestamp) < cached.ttl;
    }

    // Performance measurement methods
    measurePerformance(name, func) {
        const start = performance.now();
        const result = func();
        const duration = performance.now() - start;
        
        console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
        return result;
    }

    async measureAsyncPerformance(name, asyncFunc) {
        const start = performance.now();
        const result = await asyncFunc();
        const duration = performance.now() - start;
        
        console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
        return result;
    }

    reportPerformanceMetrics() {
        const calculations = this.performanceMetrics.calculations;
        const renders = this.performanceMetrics.renders;
        
        if (calculations.length > 0) {
            const avgCalcTime = calculations.reduce((sum, calc) => sum + calc.duration, 0) / calculations.length;
            console.log(`Average calculation time: ${avgCalcTime.toFixed(2)}ms`);
        }
        
        if (renders.length > 0) {
            const avgFPS = renders.reduce((sum, render) => sum + render.fps, 0) / renders.length;
            console.log(`Average FPS: ${avgFPS.toFixed(1)}`);
        }
    }

    // Component-specific optimizations
    enableUpdates(element) {
        element.classList.remove('updates-disabled');
    }

    disableUpdates(element) {
        element.classList.add('updates-disabled');
    }

    pauseExpensiveOperations() {
        // Pause animations
        document.body.classList.add('animations-paused');
        
        // Pause auto-calculations
        if (window.debouncedInputHandler) {
            window.debouncedInputHandler.disable();
        }
    }

    resumeExpensiveOperations() {
        // Resume animations
        document.body.classList.remove('animations-paused');
        
        // Resume auto-calculations
        if (window.debouncedInputHandler) {
            window.debouncedInputHandler.enable();
        }
    }

    // Cleanup method
    cleanup() {
        // Clear all timers
        this.throttleTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.requestAnimationFrameIds.forEach(id => cancelAnimationFrame(id));
        
        // Disconnect observers
        this.observers.forEach(observer => observer.disconnect());
        
        // Terminate workers
        this.workerPool.forEach(worker => worker.terminate());
        
        // Clear cache
        this.cache.clear();
        
        console.log('Performance optimization manager cleaned up');
    }

    // Public API methods
    optimizeForLargeDataset(size) {
        if (size > 1000) {
            // Enable aggressive optimizations for large datasets
            this.maxCacheSize = Math.min(2000, size * 2);
            document.body.classList.add('large-dataset-mode');
            
            // Use web workers for batch operations
            return true;
        }
        return false;
    }

    optimizeForRealTime() {
        // Optimize for real-time updates
        document.body.classList.add('realtime-mode');
        
        // Reduce debounce delays
        if (window.debouncedInputHandler) {
            window.debouncedInputHandler.defaultDelay = 100;
            window.debouncedInputHandler.fastDelay = 50;
        }
    }
}

// Create global instance
window.performanceManager = new PerformanceOptimizationManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizationManager;
}