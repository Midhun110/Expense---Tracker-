import { getProject, addPayment } from '../state.js';
import { navigate } from '../router.js';

export const PaymentAddView = {
    render: (params) => {
        const project = getProject(params.id);
        
        if (!project) {
            return `
                <header class="app-header">
                    <button class="btn-back" id="btn-cancel-pay-add">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back
                    </button>
                    <span class="app-title">Add Payment</span>
                </header>
                <main class="container">
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        </div>
                        <div class="empty-state-title">Project Not Found</div>
                        <button class="btn btn-primary mt-6" id="btn-err-back">Back to Projects</button>
                    </div>
                </main>
            `;
        }
        
        const today = new Date().toISOString().split('T')[0];
        
        return `
            <header class="app-header">
                <button class="btn-back" id="btn-cancel-pay-add">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back
                </button>
                <span class="app-title">Record Payment</span>
            </header>
            
            <main class="container">
                <div style="margin-bottom: 24px;">
                    <span class="detail-label" style="text-transform: uppercase; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">Project</span>
                    <h1 style="font-size: 28px; margin-bottom: 0; word-break: break-word;">${escapeHtml(project.name)}</h1>
                </div>
                
                <form id="add-payment-form" novalidate>
                    <!-- Error Box (hidden by default) -->
                    <div id="form-error" class="badge badge-completed" style="background-color: var(--color-danger-bg); color: var(--color-danger-text); border: 2px solid var(--color-danger-text); display: none; width: 100%; margin-bottom: 24px; border-radius: 12px; font-weight: 700; text-align: left; padding: 16px;">
                        Please enter a valid Payment Amount.
                    </div>
                
                    <!-- Amount -->
                    <div class="form-group">
                        <label class="form-label" for="pay-amount">Amount Received (₹) <span style="color: var(--color-danger-text);">*</span></label>
                        <input type="number" id="pay-amount" class="form-control" placeholder="e.g. 5000" inputmode="numeric" min="1" pattern="[0-9]*" required>
                    </div>
                    
                    <!-- Date -->
                    <div class="form-group">
                        <label class="form-label" for="pay-date">Payment Date</label>
                        <input type="date" id="pay-date" class="form-control" value="${today}">
                    </div>
                    
                    <!-- Note (Optional) -->
                    <div class="form-group">
                        <label class="form-label" for="pay-note">Note / Remarks (Optional)</label>
                        <input type="text" id="pay-note" class="form-control" placeholder="e.g. Cash, Advance, Google Pay">
                    </div>
                    
                    <!-- Actions Stacked -->
                    <div style="margin-top: 40px; display: flex; flex-direction: column; gap: 16px;">
                        <button type="submit" class="btn btn-primary" id="btn-save-payment">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Save Payment
                        </button>
                        <button type="button" class="btn btn-secondary" id="btn-cancel-form">
                            Cancel
                        </button>
                    </div>
                </form>
            </main>
        `;
    },
    
    init: (params) => {
        const project = getProject(params.id);
        const goBack = () => {
            navigate(`/project/${params.id}`);
        };
        
        if (!project) {
            const errBackBtn = document.getElementById('btn-err-back');
            if (errBackBtn) {
                errBackBtn.addEventListener('click', () => navigate('/'));
            }
            return;
        }
        
        const form = document.getElementById('add-payment-form');
        const errorBox = document.getElementById('form-error');
        const cancelBtn = document.getElementById('btn-cancel-form');
        const headerBackBtn = document.getElementById('btn-cancel-pay-add');
        
        cancelBtn.addEventListener('click', goBack);
        headerBackBtn.addEventListener('click', goBack);
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const amountStr = document.getElementById('pay-amount').value;
            const date = document.getElementById('pay-date').value;
            const note = document.getElementById('pay-note').value;
            
            const amount = parseFloat(amountStr);
            
            // Validate amount (required and positive)
            if (isNaN(amount) || amount <= 0) {
                errorBox.style.display = 'block';
                window.scrollTo(0, 0);
                return;
            }
            
            errorBox.style.display = 'none';
            
            // Add Payment
            addPayment(project.id, {
                amount,
                date,
                note
            });
            
            goBack();
        });
    }
};

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
