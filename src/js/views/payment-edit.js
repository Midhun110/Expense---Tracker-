import { getProject, updatePayment, deletePayment } from '../state.js';
import { navigate } from '../router.js';

export const PaymentEditView = {
    render: (params) => {
        const project = getProject(params.id);
        const payment = project ? project.payments.find(p => p.id === params.paymentId) : null;
        
        if (!project || !payment) {
            return `
                <header class="app-header">
                    <button class="btn-back" id="btn-cancel-pay-edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back
                    </button>
                    <span class="app-title">Edit Payment</span>
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
                        <div class="empty-state-title">Payment Not Found</div>
                        <button class="btn btn-primary mt-6" id="btn-err-back">Back to Project</button>
                    </div>
                </main>
            `;
        }
        
        const formattedAmount = Number(payment.amount).toLocaleString('en-IN');
        
        return `
            <header class="app-header">
                <button class="btn-back" id="btn-cancel-pay-edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Cancel
                </button>
                <span class="app-title">Edit Payment</span>
            </header>
            
            <main class="container">
                <div style="margin-bottom: 24px;">
                    <span class="detail-label" style="text-transform: uppercase; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">Project</span>
                    <h1 style="font-size: 28px; margin-bottom: 0; word-break: break-word;">${escapeHtml(project.name)}</h1>
                </div>
                
                <form id="edit-payment-form" novalidate>
                    <!-- Error Box (hidden by default) -->
                    <div id="form-error" class="badge badge-completed" style="background-color: var(--color-danger-bg); color: var(--color-danger-text); border: 2px solid var(--color-danger-text); display: none; width: 100%; margin-bottom: 24px; border-radius: 12px; font-weight: 700; text-align: left; padding: 16px;">
                        Please enter a valid Payment Amount.
                    </div>
                
                    <!-- Amount -->
                    <div class="form-group">
                        <label class="form-label" for="pay-amount">Amount Received (₹) <span style="color: var(--color-danger-text);">*</span></label>
                        <input type="number" id="pay-amount" class="form-control" value="${payment.amount}" placeholder="e.g. 5000" inputmode="numeric" min="1" pattern="[0-9]*" required>
                    </div>
                    
                    <!-- Date -->
                    <div class="form-group">
                        <label class="form-label" for="pay-date">Payment Date</label>
                        <input type="date" id="pay-date" class="form-control" value="${payment.date}">
                    </div>
                    
                    <!-- Note (Optional) -->
                    <div class="form-group">
                        <label class="form-label" for="pay-note">Note / Remarks (Optional)</label>
                        <input type="text" id="pay-note" class="form-control" value="${escapeHtml(payment.note || '')}" placeholder="e.g. Cash, Advance, Google Pay">
                    </div>
                    
                    <!-- Actions Stacked -->
                    <div style="margin-top: 40px; display: flex; flex-direction: column; gap: 16px;">
                        <button type="submit" class="btn btn-primary" id="btn-save-payment">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Save Changes
                        </button>
                        
                        <button type="button" class="btn btn-danger" id="btn-open-delete-pay">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Delete Payment
                        </button>
                        
                        <button type="button" class="btn btn-secondary" id="btn-cancel-form">
                            Cancel
                        </button>
                    </div>
                </form>
            </main>
            
            <!-- Simple Full-screen Delete Confirmation Modal -->
            <div class="modal-overlay" id="delete-pay-modal">
                <div class="modal-box">
                    <div class="modal-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <div class="modal-title">Delete Payment?</div>
                    <p class="modal-text">Are you sure you want to delete this payment of <strong>₹${formattedAmount}</strong>? This cannot be undone.</p>
                    <div class="modal-actions">
                        <button class="btn btn-danger-filled" id="btn-confirm-delete-pay">
                            Yes, Delete Payment
                        </button>
                        <button class="btn btn-secondary" id="btn-close-delete-pay">
                            No, Keep Payment
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    init: (params) => {
        const project = getProject(params.id);
        const payment = project ? project.payments.find(p => p.id === params.paymentId) : null;
        
        const goBack = () => {
            navigate(`/project/${params.id}`);
        };
        
        if (!project || !payment) {
            const errBackBtn = document.getElementById('btn-err-back');
            if (errBackBtn) {
                errBackBtn.addEventListener('click', goBack);
            }
            return;
        }
        
        const form = document.getElementById('edit-payment-form');
        const errorBox = document.getElementById('form-error');
        const cancelBtn = document.getElementById('btn-cancel-form');
        const headerCancelBtn = document.getElementById('btn-cancel-pay-edit');
        
        cancelBtn.addEventListener('click', goBack);
        headerCancelBtn.addEventListener('click', goBack);
        
        // Form Save logic
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const amountStr = document.getElementById('pay-amount').value;
            const date = document.getElementById('pay-date').value;
            const note = document.getElementById('pay-note').value;
            
            const amount = parseFloat(amountStr);
            
            if (isNaN(amount) || amount <= 0) {
                errorBox.style.display = 'block';
                window.scrollTo(0, 0);
                return;
            }
            
            errorBox.style.display = 'none';
            
            updatePayment(project.id, payment.id, {
                amount,
                date,
                note
            });
            
            goBack();
        });
        
        // Delete Modal logic
        const deleteModal = document.getElementById('delete-pay-modal');
        const openDeleteBtn = document.getElementById('btn-open-delete-pay');
        const closeDeleteBtn = document.getElementById('btn-close-delete-pay');
        const confirmDeleteBtn = document.getElementById('btn-confirm-delete-pay');
        
        const openModal = () => {
            deleteModal.classList.add('open');
            document.body.classList.add('scroll-locked');
        };
        
        const closeModal = () => {
            deleteModal.classList.remove('open');
            document.body.classList.remove('scroll-locked');
        };
        
        openDeleteBtn.addEventListener('click', openModal);
        closeDeleteBtn.addEventListener('click', closeModal);
        
        // Close modal if background clicked
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                closeModal();
            }
        });
        
        confirmDeleteBtn.addEventListener('click', () => {
            closeModal();
            deletePayment(project.id, payment.id);
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
