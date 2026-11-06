import { getProjects } from '../state.js';

let searchQuery = '';

function formatPrice(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
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

export const DashboardView = {
    render: () => {
        searchQuery = '';
        const projects = getProjects();
        
        // Header greeting
        const hour = new Date().getHours();
        let greeting = 'Good Morning 👋';
        if (hour >= 12 && hour < 17) {
            greeting = 'Good Afternoon 👋';
        } else if (hour >= 17 || hour < 4) {
            greeting = 'Good Evening 👋';
        }
        
        // Format Date (e.g., "20 Jul")
        const todayDateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        
        // Calculations for Today's Summary
        const todayStr = new Date().toISOString().split('T')[0];
        let todayExpenses = 0;
        let todayPayments = 0;
        let pendingCollection = 0;
        let activeProjectsCount = 0;

        projects.forEach(p => {
            (p.payments || []).forEach(pay => {
                if (pay.date === todayStr) {
                    todayPayments += pay.amount;
                }
            });
            
            (p.expenses || []).forEach(exp => {
                if (exp.date === todayStr) {
                    todayExpenses += exp.amount;
                }
            });
            
            if (p.status === 'Running') {
                activeProjectsCount++;
                const received = (p.payments || []).reduce((sum, pay) => sum + pay.amount, 0);
                const finalContractAmount = p.amount || 0;
                const pDiscount = parseFloat(p.discount) || 0;
                const remaining = Math.max(0, finalContractAmount - pDiscount - received);
                pendingCollection += remaining;
            }
        });

        return `
            <!-- Header Section -->
            <header class="dashboard-header" style="background-color: var(--bg-card); padding: 24px 20px; border-bottom: 2px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-soft);">
                <div>
                    <div style="font-size: 16px; color: var(--text-secondary); font-weight: 600;">${greeting}</div>
                    <h1 style="font-size: 26px; font-weight: 800; color: var(--text-primary); margin-top: 4px; margin-bottom: 0; line-height: 1.2;">Nikhil Wood Industries</h1>
                </div>
                <div style="background-color: var(--color-primary-light); color: var(--color-primary); padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 16px; white-space: nowrap;">
                    ${todayDateStr}
                </div>
            </header>
            
            <main class="container" style="padding-bottom: 30px;">
                <!-- Primary Action -->
                <div style="margin-bottom: 24px;">
                    <a href="#/add" class="btn-new-project-large" style="display: flex; align-items: center; justify-content: center; background-color: var(--color-primary); color: #FFFFFF; text-decoration: none; padding: 22px 24px; border-radius: 18px; font-size: 24px; font-weight: 700; gap: 10px; box-shadow: 0 6px 20px rgba(211, 84, 0, 0.3);">
                        <span style="font-size: 28px; line-height: 1;">+</span> New Project
                    </a>
                </div>
                
                <!-- Search customer or project -->
                <div style="margin-bottom: 32px;">
                    <div style="position: relative; display: flex; align-items: center;">
                        <span style="position: absolute; left: 18px; font-size: 22px; color: var(--text-secondary);">🔍</span>
                        <input type="text" id="search-input" placeholder="Search customer or project..." style="width: 100%; height: 60px; padding: 0 16px 0 54px; border: 2.5px solid var(--border-color); border-radius: 16px; font-size: 18px; font-weight: 600; background-color: #FFFFFF; color: var(--text-primary); outline: none; box-shadow: var(--shadow-soft);" />
                    </div>
                </div>
                
                <!-- Continue Working section -->
                <div style="margin-bottom: 32px;">
                    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 16px; color: var(--text-primary);">Continue Working</h2>
                    <div id="continue-working-container">
                        <!-- Dynamically populated 5 projects -->
                    </div>
                </div>
                
                <!-- Today's Summary section -->
                <div style="margin-bottom: 32px;">
                    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 16px; color: var(--text-primary);">Today's Summary</h2>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                        <div style="background-color: #FFFFFF; border: 2px solid var(--border-color); border-radius: 16px; padding: 18px 16px; box-shadow: var(--shadow-soft);">
                            <div style="font-size: 14px; color: var(--text-secondary); font-weight: 600;">Today's Expenses</div>
                            <div style="font-size: 24px; font-weight: 800; color: var(--color-danger-text); margin-top: 6px;">${formatPrice(todayExpenses)}</div>
                        </div>
                        
                        <div style="background-color: #FFFFFF; border: 2px solid var(--border-color); border-radius: 16px; padding: 18px 16px; box-shadow: var(--shadow-soft);">
                            <div style="font-size: 14px; color: var(--text-secondary); font-weight: 600;">Today's Payments</div>
                            <div style="font-size: 24px; font-weight: 800; color: var(--color-running-text); margin-top: 6px;">${formatPrice(todayPayments)}</div>
                        </div>
                        
                        <div style="background-color: #FFFFFF; border: 2px solid var(--border-color); border-radius: 16px; padding: 18px 16px; box-shadow: var(--shadow-soft);">
                            <div style="font-size: 14px; color: var(--text-secondary); font-weight: 600;">Pending Collection</div>
                            <div style="font-size: 24px; font-weight: 800; color: #2980B9; margin-top: 6px;">${formatPrice(pendingCollection)}</div>
                        </div>
                        
                        <div style="background-color: #FFFFFF; border: 2px solid var(--border-color); border-radius: 16px; padding: 18px 16px; box-shadow: var(--shadow-soft);">
                            <div style="font-size: 14px; color: var(--text-secondary); font-weight: 600;">Active Projects</div>
                            <div style="font-size: 24px; font-weight: 800; color: var(--color-primary); margin-top: 6px;">${activeProjectsCount}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions section -->
                <div style="margin-bottom: 24px;">
                    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 16px; color: var(--text-primary);">Quick Actions</h2>
                    <div class="quick-actions-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                        <button id="quick-add-payment" class="btn btn-secondary" style="height: 110px; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 16px; border: 2px solid var(--border-color); background-color: #FFFFFF; box-shadow: var(--shadow-soft); gap: 8px; font-size: 16px; font-weight: 700; color: var(--text-primary); cursor: pointer;">
                            <span style="font-size: 32px;">💰</span> Add Payment
                        </button>
                        
                        <button id="quick-add-expense" class="btn btn-secondary" style="height: 110px; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 16px; border: 2px solid var(--border-color); background-color: #FFFFFF; box-shadow: var(--shadow-soft); gap: 8px; font-size: 16px; font-weight: 700; color: var(--text-primary); cursor: pointer;">
                            <span style="font-size: 32px;">💸</span> Add Expense
                        </button>
                        
                        <a href="#/add" class="btn btn-secondary" style="height: 110px; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 16px; border: 2px solid var(--border-color); background-color: #FFFFFF; box-shadow: var(--shadow-soft); gap: 8px; font-size: 16px; font-weight: 700; color: var(--text-primary); text-decoration: none;">
                            <span style="font-size: 32px;">📄</span> Generate Quotation
                        </a>
                        
                        <a href="#/projects" class="btn btn-secondary" style="height: 110px; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 16px; border: 2px solid var(--border-color); background-color: #FFFFFF; box-shadow: var(--shadow-soft); gap: 8px; font-size: 16px; font-weight: 700; color: var(--text-primary); text-decoration: none;">
                            <span style="font-size: 32px;">👥</span> Customers
                        </a>
                    </div>
                </div>
            </main>
        `;
    },
    
    init: () => {
        const renderList = () => {
            const projects = getProjects();
            const container = document.getElementById('continue-working-container');
            if (!container) return;
            
            const query = searchQuery.toLowerCase().trim();
            const matchedProjects = projects.filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(query) || (p.client && p.client.toLowerCase().includes(query));
                return matchesSearch;
            });
            
            const projectsToShow = matchedProjects.slice(0, 5);
            
            if (projectsToShow.length === 0) {
                container.innerHTML = `
                    <div style="padding: 30px; text-align: center; background-color: #FFFFFF; border-radius: 16px; border: 2px dashed var(--border-color); margin-bottom: 16px;">
                        <p style="font-size: 16px; color: var(--text-secondary);">No projects found</p>
                    </div>
                `;
                return;
            }
            
            let html = projectsToShow.map(proj => {
                const payments = proj.payments || [];
                const received = payments.reduce((sum, p) => sum + p.amount, 0);
                const finalContractAmount = proj.amount || 0;
                const projDiscount = parseFloat(proj.discount) || 0;
                const remaining = Math.max(0, finalContractAmount - projDiscount - received);
                
                return `
                    <div class="project-card-large" style="background-color: #FFFFFF; border: 2px solid var(--border-color); border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: var(--shadow-soft); display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 20px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                                👤 ${escapeHtml(proj.client || proj.name)}
                            </span>
                            <span class="badge ${proj.status === 'Running' ? 'badge-running' : 'badge-completed'}" style="font-size: 14px; padding: 6px 12px;">
                                ${proj.status}
                            </span>
                        </div>
                        
                        <div style="font-size: 18px; font-weight: 700; color: ${remaining > 0 ? '#2980B9' : 'var(--text-secondary)'};">
                            ${formatPrice(remaining)} Remaining
                        </div>
                        
                        <a href="#/project/${proj.id}" class="btn-open-project" style="display: flex; align-items: center; justify-content: center; background-color: var(--color-primary-light); color: var(--color-primary); text-decoration: none; padding: 14px; border-radius: 12px; font-size: 18px; font-weight: 700; gap: 6px; box-shadow: var(--shadow-soft);">
                            ▶ Open
                        </a>
                    </div>
                `;
            }).join('');
            
            if (matchedProjects.length > 5) {
                html += `
                    <div style="text-align: center; margin-top: 12px;">
                        <a href="#/projects" style="font-size: 18px; font-weight: 700; color: var(--color-primary); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                            View All Projects →
                        </a>
                    </div>
                `;
            }
            
            container.innerHTML = html;
        };

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                renderList();
            });
        }
        
        const quickAddPayment = document.getElementById('quick-add-payment');
        if (quickAddPayment) {
            quickAddPayment.addEventListener('click', () => {
                const fab = document.getElementById('global-fab');
                if (fab) fab.click();
                setTimeout(() => {
                    const payBtn = document.getElementById('btn-action-receive-payment');
                    if (payBtn) payBtn.click();
                }, 50);
            });
        }
        
        const quickAddExpense = document.getElementById('quick-add-expense');
        if (quickAddExpense) {
            quickAddExpense.addEventListener('click', () => {
                const fab = document.getElementById('global-fab');
                if (fab) fab.click();
                setTimeout(() => {
                    const expBtn = document.getElementById('btn-action-add-expense');
                    if (expBtn) expBtn.click();
                }, 50);
            });
        }

        renderList();
    }
};
