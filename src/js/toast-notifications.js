/**
 * Toast Notification System
 * Provides user feedback and error handling with accessibility support
 */

class ToastNotificationSystem {
    constructor() {
        this.toasts = new Map();
        this.container = null;
        this.maxToasts = 5;
        this.defaultDuration = 4000;
        this.init();
    }

    init() {
        this.createContainer();
        this.setupStyles();
        console.log('Toast notification system initialized');
    }

    createContainer() {
        // Create toast container if it doesn't exist
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            this.container.setAttribute('aria-live', 'polite');
            this.container.setAttribute('aria-atomic', 'false');
            this.container.setAttribute('role', 'status');
            document.body.appendChild(this.container);
        }
    }

    setupStyles() {
        // Add CSS if not already present
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    pointer-events: none;
                    max-width: 400px;
                }

                .toast {
                    background: var(--panel, #ffffff);
                    border: 1px solid var(--border-color, #e5e7eb);
                    border-radius: var(--radius-lg, 12px);
                    padding: 16px 20px;
                    box-shadow: var(--shadow-strong, 0 10px 25px rgba(0, 0, 0, 0.15));
                    backdrop-filter: blur(20px);
                    pointer-events: auto;
                    transform: translateX(100%);
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    min-height: 60px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .toast.show {
                    transform: translateX(0);
                    opacity: 1;
                }

                .toast.hide {
                    transform: translateX(100%);
                    opacity: 0;
                }

                .toast::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 4px;
                    height: 100%;
                    background: var(--toast-accent, #3b82f6);
                }

                .toast.success::before {
                    background: var(--accent-secondary, #10b981);
                }

                .toast.warning::before {
                    background: var(--accent-warning, #f59e0b);
                }

                .toast.error::before {
                    background: var(--accent-danger, #ef4444);
                }

                .toast.info::before {
                    background: var(--accent-primary, #3b82f6);
                }

                .toast-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .toast-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .toast-title {
                    font-weight: 600;
                    font-size: 14px;
                    color: var(--text-primary, #1f2937);
                    margin: 0;
                }

                .toast-message {
                    font-size: 13px;
                    color: var(--text-secondary, #6b7280);
                    margin: 0;
                    line-height: 1.4;
                }

                .toast-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                }

                .toast-action {
                    padding: 4px 12px;
                    background: transparent;
                    border: 1px solid var(--border-color, #e5e7eb);
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: var(--text-secondary, #6b7280);
                }

                .toast-action:hover {
                    background: var(--hover-bg, rgba(59, 130, 246, 0.1));
                    border-color: var(--accent-primary, #3b82f6);
                    color: var(--accent-primary, #3b82f6);
                }

                .toast-close {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: var(--text-muted, #9ca3af);
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                }

                .toast-close:hover {
                    background: var(--hover-bg, rgba(0, 0, 0, 0.1));
                    color: var(--text-primary, #1f2937);
                }

                .toast-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 2px;
                    background: var(--toast-accent, #3b82f6);
                    transition: width linear;
                    opacity: 0.7;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .toast-container {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }

                    .toast {
                        transform: translateY(-100%);
                    }

                    .toast.show {
                        transform: translateY(0);
                    }

                    .toast.hide {
                        transform: translateY(-100%);
                    }
                }

                /* Dark mode support */
                :root[data-theme="dark"] .toast {
                    background: var(--panel, rgba(30, 41, 59, 0.95));
                    border-color: var(--border-color, rgba(255, 255, 255, 0.1));
                }

                /* Accessibility */
                .toast:focus {
                    outline: 2px solid var(--accent-primary, #3b82f6);
                    outline-offset: 2px;
                }

                /* Animation for stacking */
                .toast-container .toast:not(:last-child) {
                    margin-bottom: 0;
                }

                .toast-container .toast + .toast {
                    margin-top: -2px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    show(options) {
        const {
            type = 'info',
            title = '',
            message = '',
            duration = this.defaultDuration,
            actions = [],
            persistent = false,
            id = null
        } = options;

        // Generate unique ID if not provided
        const toastId = id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Remove existing toast with same ID
        if (this.toasts.has(toastId)) {
            this.hide(toastId);
        }

        // Limit number of toasts
        if (this.toasts.size >= this.maxToasts) {
            const oldestToast = this.toasts.keys().next().value;
            this.hide(oldestToast);
        }

        // Create toast element
        const toast = this.createToastElement({
            id: toastId,
            type,
            title,
            message,
            actions,
            persistent,
            duration
        });

        // Add to container and track
        this.container.appendChild(toast);
        this.toasts.set(toastId, {
            element: toast,
            timer: null,
            type,
            persistent
        });

        // Show with animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Set up auto-hide timer if not persistent
        if (!persistent && duration > 0) {
            const timer = setTimeout(() => {
                this.hide(toastId);
            }, duration);
            this.toasts.get(toastId).timer = timer;
        }

        // Set up progress bar if duration is set
        if (!persistent && duration > 0) {
            this.animateProgress(toast, duration);
        }

        return toastId;
    }

    createToastElement({ id, type, title, message, actions, persistent, duration }) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = id;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.tabIndex = 0;

        // Get icon for type
        const icon = this.getIconForType(type);

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${this.escapeHtml(title)}</div>` : ''}
                ${message ? `<div class="toast-message">${this.escapeHtml(message)}</div>` : ''}
                ${actions.length > 0 ? this.createActionsHtml(actions, id) : ''}
            </div>
            ${!persistent ? '<button class="toast-close" aria-label="Close notification">×</button>' : ''}
            ${!persistent && duration > 0 ? '<div class="toast-progress"></div>' : ''}
        `;

        // Set up event listeners
        this.setupToastEventListeners(toast, id);

        return toast;
    }

    getIconForType(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    createActionsHtml(actions, toastId) {
        const actionsHtml = actions.map(action => {
            const actionId = `toast-action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            return `<button class="toast-action" data-action="${action.action}" data-toast-id="${toastId}" id="${actionId}">${this.escapeHtml(action.label)}</button>`;
        }).join('');

        return `<div class="toast-actions">${actionsHtml}</div>`;
    }

    setupToastEventListeners(toast, toastId) {
        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide(toastId);
            });
        }

        // Action buttons
        const actionBtns = toast.querySelectorAll('.toast-action');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                this.handleAction(action, toastId);
            });
        });

        // Keyboard support
        toast.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide(toastId);
            }
        });

        // Pause timer on hover/focus
        toast.addEventListener('mouseenter', () => {
            this.pauseTimer(toastId);
        });

        toast.addEventListener('mouseleave', () => {
            this.resumeTimer(toastId);
        });

        toast.addEventListener('focus', () => {
            this.pauseTimer(toastId);
        });

        toast.addEventListener('blur', () => {
            this.resumeTimer(toastId);
        });
    }

    animateProgress(toast, duration) {
        const progressBar = toast.querySelector('.toast-progress');
        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.style.transition = `width ${duration}ms linear`;
            
            requestAnimationFrame(() => {
                progressBar.style.width = '0%';
            });
        }
    }

    pauseTimer(toastId) {
        const toastData = this.toasts.get(toastId);
        if (toastData && toastData.timer) {
            clearTimeout(toastData.timer);
            toastData.timer = null;
        }
    }

    resumeTimer(toastId) {
        const toastData = this.toasts.get(toastId);
        if (toastData && !toastData.persistent && !toastData.timer) {
            // Resume with remaining time (simplified - could be enhanced)
            toastData.timer = setTimeout(() => {
                this.hide(toastId);
            }, 2000); // Simplified resume time
        }
    }

    hide(toastId) {
        const toastData = this.toasts.get(toastId);
        if (!toastData) return;

        const { element, timer } = toastData;

        // Clear timer
        if (timer) {
            clearTimeout(timer);
        }

        // Hide with animation
        element.classList.remove('show');
        element.classList.add('hide');

        // Remove from DOM after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.toasts.delete(toastId);
        }, 300);
    }

    handleAction(action, toastId) {
        // Emit custom event for action handling
        const event = new CustomEvent('toastAction', {
            detail: { action, toastId }
        });
        document.dispatchEvent(event);

        // Hide toast after action
        this.hide(toastId);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Convenience methods
    success(title, message, options = {}) {
        return this.show({ ...options, type: 'success', title, message });
    }

    error(title, message, options = {}) {
        return this.show({ ...options, type: 'error', title, message });
    }

    warning(title, message, options = {}) {
        return this.show({ ...options, type: 'warning', title, message });
    }

    info(title, message, options = {}) {
        return this.show({ ...options, type: 'info', title, message });
    }

    // Clear all toasts
    clear() {
        this.toasts.forEach((_, toastId) => {
            this.hide(toastId);
        });
    }

    // Update existing toast
    update(toastId, options) {
        if (this.toasts.has(toastId)) {
            this.hide(toastId);
            return this.show({ ...options, id: toastId });
        }
        return null;
    }
}

// Create global instance
window.toastSystem = new ToastNotificationSystem();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToastNotificationSystem;
}