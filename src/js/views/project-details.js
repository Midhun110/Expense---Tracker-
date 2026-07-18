import { getProject, deleteProject } from '../state.js';
import { navigate } from '../router.js';

function formatPrice(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatDate(dateStr) {
    if (!dateStr) return 'Not set';
    // Format YYYY-MM-DD to DD-MM-YYYY for easy reading
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatActivityDateTime(timestamp) {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    
    const dateStr = date.toDateString();
    const nowStr = now.toDateString();
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    let dateLabel = '';
    if (dateStr === nowStr) {
        dateLabel = 'Today';
    } else if (dateStr === yesterdayStr) {
        dateLabel = 'Yesterday';
    } else {
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        dateLabel = (d < 10 ? '0' + d : d) + '-' + (m < 10 ? '0' + m : m) + '-' + y;
    }
    
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const timeLabel = hours + ':' + strMinutes + ' ' + ampm;
    
    return dateLabel + ', ' + timeLabel;
}

export const ProjectDetailsView = {
    render: (params) => {
        const project = getProject(params.id);
        
        if (!project) {
            return `
                <header class="app-header">
                    <button class="btn-back" id="btn-back-home">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back
                    </button>
                    <span class="app-title">Project Details</span>
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
                        <p>This project may have been deleted.</p>
                        <button class="btn btn-primary mt-6" id="btn-err-back">Back to Projects</button>
                    </div>
                </main>
            `;
        }
        
        const badgeClass = project.status === 'Running' ? 'badge-running' : 'badge-completed';
        
        // Calculate total received and sort payments chronologically (oldest to newest)
        const payments = [...(project.payments || [])];
        payments.sort((a, b) => {
            if (a.date < b.date) return -1;
            if (a.date > b.date) return 1;
            return a.id.localeCompare(b.id);
        });
        
        const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
        
        // Generate payments HTML list
        let paymentsListHtml = '';
        if (payments.length === 0) {
            paymentsListHtml = `
                <div style="padding: 24px 12px; border: 2px dashed var(--border-color); border-radius: var(--border-radius); text-align: center;">
                    <div style="font-size: 18px; font-weight: 500; color: var(--text-secondary);">No payments recorded yet</div>
                </div>
            `;
        } else {
            paymentsListHtml = payments.map(pay => `
                <div class="payment-card">
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;">
                            <span style="font-size: 22px; font-weight: 700; color: var(--text-primary);">${formatPrice(pay.amount)}</span>
                            <span style="font-size: 16px; color: var(--text-secondary);">${formatDate(pay.date)}</span>
                        </div>
                        ${pay.note ? `<div style="font-size: 16px; color: var(--text-secondary); margin-top: 4px; font-style: italic; word-break: break-word;">"${escapeHtml(pay.note)}"</div>` : ''}
                    </div>
                    <a href="#/project/${project.id}/payment/${pay.id}/edit" class="btn btn-secondary" style="height: 48px; width: auto; padding: 0 16px; font-size: 16px; border-radius: 8px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; border: 1.5px solid #CBD5E1;">
                        Edit
                    </a>
                </div>
            `).join('');
        }

        // Calculate total expenses and group by date
        const expenses = [...(project.expenses || [])];
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        
        const ownPocket = Math.max(0, totalExpenses - totalReceived);
        const remainingToReceive = Math.max(0, project.amount - totalReceived);
        
        const expensesByDate = {};
        expenses.forEach(exp => {
            if (!expensesByDate[exp.date]) {
                expensesByDate[exp.date] = [];
            }
            expensesByDate[exp.date].push(exp);
        });
        
        const sortedDates = Object.keys(expensesByDate).sort((a, b) => b.localeCompare(a));
        
        let expensesListHtml = '';
        if (sortedDates.length === 0) {
            expensesListHtml = `
                <div style="padding: 24px 12px; border: 2px dashed var(--border-color); border-radius: var(--border-radius); text-align: center;">
                    <div style="font-size: 18px; font-weight: 500; color: var(--text-secondary);">No expenses recorded yet</div>
                </div>
            `;
        } else {
            expensesListHtml = sortedDates.map(date => {
                const dateGroupExpenses = expensesByDate[date];
                dateGroupExpenses.sort((a, b) => a.id.localeCompare(b.id)); // sort by ID chronologically
                
                const groupCardsHtml = dateGroupExpenses.map(exp => `
                    <div class="payment-card" style="margin-bottom: 8px;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;">
                                <span style="font-size: 22px; font-weight: 700; color: var(--text-primary);">${formatPrice(exp.amount)}</span>
                                <span class="badge" style="font-size: 14px; padding: 4px 10px; background-color: var(--color-primary-light); color: var(--color-primary); border: 1px solid rgba(211, 84, 0, 0.2);">${exp.category}</span>
                            </div>
                            ${exp.note ? `<div style="font-size: 16px; color: var(--text-secondary); margin-top: 4px; font-style: italic; word-break: break-word;">"${escapeHtml(exp.note)}"</div>` : ''}
                        </div>
                        <a href="#/project/${project.id}/expense/${exp.id}/edit" class="btn btn-secondary" style="height: 48px; width: auto; padding: 0 16px; font-size: 16px; border-radius: 8px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; border: 1.5px solid #CBD5E1;">
                            Edit
                        </a>
                    </div>
                `).join('');
                
                return `
                    <div style="margin-bottom: 20px;">
                        <div class="expense-date-header">${formatDate(date)}</div>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${groupCardsHtml}
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Render Recent Activity timeline sorted descending (newest first)
        const activityLog = [...(project.activityLog || [])].sort((a, b) => b.timestamp - a.timestamp);
        let activityLogHtml = '';
        if (activityLog.length === 0) {
            activityLogHtml = `
                <div style="padding: 24px 12px; border: 2px dashed var(--border-color); border-radius: var(--border-radius); text-align: center;">
                    <div style="font-size: 18px; font-weight: 500; color: var(--text-secondary);">No activity recorded yet</div>
                </div>
            `;
        } else {
            activityLogHtml = `
                <div class="activity-timeline">
                    ${activityLog.map(act => {
                        const typeClass = (act.type === 'payment_received' || act.type === 'payment_edited') ? 'type-payment' : 'type-expense';
                        const titleMap = {
                            payment_received: 'Received Payment',
                            payment_edited: 'Payment Edited',
                            expense_added: 'Recorded Expense',
                            expense_edited: 'Expense Edited'
                        };
                        const title = titleMap[act.type] || 'Activity';
                        return `
                            <div class="activity-node">
                                <div class="activity-dot ${typeClass}"></div>
                                <div class="activity-bubble ${typeClass}">
                                    <div class="activity-bubble-header">
                                        <span class="activity-title ${typeClass}">${title}</span>
                                        <span class="activity-time">${formatActivityDateTime(act.timestamp)}</span>
                                    </div>
                                    <div style="display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;">
                                        <span style="font-size: 20px; font-weight: 700; color: var(--text-primary);">${formatPrice(act.amount)}</span>
                                        ${act.category ? `<span class="badge" style="font-size: 13px; padding: 2px 8px; background-color: var(--color-primary-light); color: var(--color-primary);">${act.category}</span>` : ''}
                                    </div>
                                    ${act.note ? `<div style="font-size: 15px; color: var(--text-secondary); font-style: italic; word-break: break-word;">"${escapeHtml(act.note)}"</div>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
        
        return `
            <header class="app-header">
                <button class="btn-back" id="btn-back-home">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back
                </button>
                <span class="app-title">Project Info</span>
            </header>
            
            <main class="container">
                <div style="margin-bottom: 24px;">
                    <span class="badge ${badgeClass}" style="margin-bottom: 12px;">${project.status}</span>
                    <h1 style="margin-bottom: 8px; word-break: break-word;">${escapeHtml(project.name)}</h1>
                </div>
                
                <!-- Project Basic Info Panel -->
                <div style="background-color: var(--bg-card); border: 2px solid var(--border-color); border-radius: var(--border-radius); padding: 20px; margin-bottom: 24px; box-shadow: var(--shadow-soft); display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                        <span style="font-size: 16px; color: var(--text-secondary); font-weight: 500;">Client</span>
                        <span style="font-size: 20px; font-weight: 700; color: var(--text-primary);">${project.client ? escapeHtml(project.client) : '<i>No name</i>'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 16px; color: var(--text-secondary); font-weight: 500;">Start Date</span>
                        <span style="font-size: 20px; font-weight: 600; color: var(--text-primary);">${formatDate(project.startDate)}</span>
                    </div>
                </div>
                
                <!-- Money Summary Board -->
                <div style="margin-bottom: 32px;">
                    <h2 class="mb-4">Money Board</h2>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 12px;">
                        <!-- Contract Price -->
                        <div style="background-color: var(--bg-card); border: 2px solid var(--border-color); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-soft);">
                            <div style="font-size: 14px; color: var(--text-secondary); font-weight: 600;">Contract Price</div>
                            <div style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${formatPrice(project.amount)}</div>
                        </div>
                        
                        <!-- Total Received -->
                        <div style="background-color: var(--color-running-bg); border: 2px solid rgba(17, 120, 100, 0.2); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-soft);">
                            <div style="font-size: 14px; color: var(--color-running-text); font-weight: 600;">Total Received</div>
                            <div style="font-size: 22px; font-weight: 700; color: var(--color-running-text); margin-top: 4px;">${formatPrice(totalReceived)}</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 12px;">
                        <!-- Total Expenses -->
                        <div style="background-color: var(--color-danger-bg); border: 2px solid rgba(192, 57, 43, 0.2); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-soft);">
                            <div style="font-size: 14px; color: var(--color-danger-text); font-weight: 600;">Total Expenses</div>
                            <div style="font-size: 22px; font-weight: 700; color: var(--color-danger-text); margin-top: 4px;">${formatPrice(totalExpenses)}</div>
                        </div>
                        
                        <!-- Paid from Own Pocket -->
                        <div style="background-color: ${ownPocket > 0 ? 'var(--color-danger-bg)' : 'var(--bg-card)'}; border: 2px solid ${ownPocket > 0 ? 'var(--color-danger-text)' : 'var(--border-color)'}; border-radius: 12px; padding: 16px; box-shadow: var(--shadow-soft);">
                            <div style="font-size: 14px; color: ${ownPocket > 0 ? 'var(--color-danger-text)' : 'var(--text-secondary)'}; font-weight: 600;">Paid from Pocket</div>
                            <div style="font-size: 22px; font-weight: 700; color: ${ownPocket > 0 ? 'var(--color-danger-text)' : 'var(--text-primary)'}; margin-top: 4px;">${formatPrice(ownPocket)}</div>
                        </div>
                    </div>
                    
                    <!-- Remaining to Receive -->
                    <div style="background-color: #EBF5FB; border: 2px solid #5DADE2; border-radius: 12px; padding: 20px; box-shadow: var(--shadow-soft); text-align: center;">
                        <div style="font-size: 16px; color: #2980B9; font-weight: 700;">Remaining to Receive</div>
                        <div style="font-size: 30px; font-weight: 800; color: #1B4F72; margin-top: 4px;">${formatPrice(remainingToReceive)}</div>
                    </div>
                </div>
                
                <!-- Money Received Section -->
                <div style="margin-top: 32px; margin-bottom: 32px; border-top: 2px solid var(--border-color); padding-top: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px; flex-wrap: wrap; gap: 8px;">
                        <h2 style="margin-bottom: 0;">Money Received</h2>
                        <div style="font-size: 22px; font-weight: 700; color: var(--color-running-text);">
                            Total: ${formatPrice(totalReceived)}
                        </div>
                    </div>
                    
                    <!-- Payments Stack -->
                    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                        ${paymentsListHtml}
                    </div>
                    
                    <!-- Record Payment Button -->
                    <a href="#/project/${project.id}/payment/add" class="btn btn-secondary" style="border: 2.5px dashed var(--color-primary); color: var(--color-primary); background-color: var(--color-primary-light); height: 60px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        + Record Payment
                    </a>
                </div>

                <!-- Expenses Section -->
                <div style="margin-top: 32px; margin-bottom: 32px; border-top: 2px solid var(--border-color); padding-top: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px; flex-wrap: wrap; gap: 8px;">
                        <h2 style="margin-bottom: 0;">Expenses</h2>
                        <div style="font-size: 22px; font-weight: 700; color: var(--color-danger-text);">
                            Total: ${formatPrice(totalExpenses)}
                        </div>
                    </div>
                    
                    <!-- Expenses Grouped List -->
                    <div>
                        ${expensesListHtml}
                    </div>
                    
                    <!-- Record Expense Button -->
                    <a href="#/project/${project.id}/expense/add" class="btn btn-secondary" style="border: 2.5px dashed var(--color-primary); color: var(--color-primary); background-color: var(--color-primary-light); height: 60px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        + Record Expense
                    </a>
                </div>
                
                <!-- Recent Activity Section -->
                <div style="margin-top: 32px; margin-bottom: 32px; border-top: 2px solid var(--border-color); padding-top: 24px;">
                    <h2 class="mb-4">Recent Activity</h2>
                    ${activityLogHtml}
                </div>
                
                <!-- Action Buttons Stacked vertically -->
                <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 36px; border-top: 2px solid var(--border-color); padding-top: 24px;">
                    <a href="#/project/${project.id}/edit" class="btn btn-primary" id="btn-edit-details">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
                        </svg>
                        Edit Details
                    </a>
                    
                    <button class="btn btn-danger" id="btn-open-delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Delete Project
                    </button>
                </div>
            </main>
            
            <!-- Simple Full-screen Delete Confirmation Modal -->
            <div class="modal-overlay" id="delete-modal">
                <div class="modal-box">
                    <div class="modal-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <div class="modal-title">Delete Project?</div>
                    <p class="modal-text">Are you sure you want to delete <strong>${project ? escapeHtml(project.name) : ''}</strong>? This cannot be undone.</p>
                    <div class="modal-actions">
                        <button class="btn btn-danger-filled" id="btn-confirm-delete">
                            Yes, Delete Project
                        </button>
                        <button class="btn btn-secondary" id="btn-close-delete">
                            No, Keep Project
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    init: (params) => {
        const project = getProject(params.id);
        const backBtn = document.getElementById('btn-back-home');
        
        const goBack = () => {
            navigate('/');
        };
        
        if (backBtn) {
            backBtn.addEventListener('click', goBack);
        }
        
        if (!project) {
            const errBackBtn = document.getElementById('btn-err-back');
            if (errBackBtn) {
                errBackBtn.addEventListener('click', goBack);
            }
            return;
        }
        
        const deleteModal = document.getElementById('delete-modal');
        const openDeleteBtn = document.getElementById('btn-open-delete');
        const closeDeleteBtn = document.getElementById('btn-close-delete');
        const confirmDeleteBtn = document.getElementById('btn-confirm-delete');
        
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
        
        // Close modal if clicked on background
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                closeModal();
            }
        });
        
        confirmDeleteBtn.addEventListener('click', () => {
            closeModal();
            deleteProject(project.id);
            navigate('/');
        });
    }
};
