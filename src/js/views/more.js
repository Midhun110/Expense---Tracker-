export const MoreView = {
    render: () => {
        return `
            <header class="app-header" style="background-color: var(--bg-card); padding: 20px 24px; border-bottom: 2px solid var(--border-color);">
                <span class="app-title">More Settings</span>
            </header>
            
            <main class="container" style="padding-bottom: 30px;">
                <div style="text-align: center; margin-bottom: 32px; padding: 24px 0;">
                    <div style="font-size: 64px; margin-bottom: 12px;">⚙️</div>
                    <h2 style="font-size: 26px; font-weight: 800; color: var(--text-primary);">Nikhil Wood Industries</h2>
                    <p style="font-size: 16px; color: var(--text-secondary); margin-top: 4px;">App Version 1.1.0</p>
                </div>
                
                <!-- Options Grid -->
                <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px;">
                    <!-- Instructions -->
                    <div style="background-color: #FFFFFF; border: 2px solid var(--border-color); border-radius: 16px; padding: 20px; box-shadow: var(--shadow-soft);">
                        <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">📖 How to Use</h3>
                        <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.4;">
                            1. Tap <strong>+ New Project</strong> to create a new carpentry contract.<br>
                            2. Record client advances under <strong>Add Payment</strong>.<br>
                            3. Keep track of materials cost under <strong>Add Expense</strong>.<br>
                            4. Click <strong>Print PDF</strong> on any project to download the quotation.
                        </p>
                    </div>
                    
                    <!-- Reset Button Option -->
                    <button id="btn-reset-db" style="display: flex; align-items: center; justify-content: center; background-color: var(--color-danger-bg); color: var(--color-danger-text); border: 2px solid var(--color-danger-text); padding: 16px; border-radius: 16px; font-size: 18px; font-weight: 700; cursor: pointer; gap: 10px;">
                        ⚠️ Reset Database
                    </button>
                </div>
            </main>
        `;
    },
    
    init: () => {
        const resetBtn = document.getElementById('btn-reset-db');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete all projects and reset the application? This action cannot be undone.')) {
                    window.location.search = '?reset=true';
                }
            });
        }
    }
};
