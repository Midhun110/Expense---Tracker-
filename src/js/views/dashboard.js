import { getProjects } from '../state.js';

let searchQuery = '';
let filterValue = 'All';

function formatPrice(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export const DashboardView = {
    render: () => {
        // Reset filters when view is loaded
        searchQuery = '';
        filterValue = 'All';

        const projects = getProjects();
        
        // Calculate business-wide metrics
        let runningCount = 0;
        let completedCount = 0;
        let totalToReceive = 0;
        let totalOwnMoney = 0;
        
        projects.forEach(p => {
            const payments = p.payments || [];
            const expenses = p.expenses || [];
            
            const received = payments.reduce((sum, pay) => sum + pay.amount, 0);
            const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            
            const remaining = Math.max(0, p.amount - received);
            const ownPocket = Math.max(0, spent - received);
            
            if (p.status === 'Running') {
                runningCount++;
            } else if (p.status === 'Completed') {
                completedCount++;
            }
            
            totalToReceive += remaining;
            totalOwnMoney += ownPocket;
        });

        return `
            <header class="app-header">
                <div class="app-title-container">
                    <div class="app-logo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/>
                            <path d="M15 13 9 7"/>
                            <path d="m9 22 10-10L15 8"/>
                            <path d="M18 17h4"/>
                            <path d="M19 12h3"/>
                            <path d="M16 22h4"/>
                        </svg>
                    </div>
                    <span class="app-title">Jp</span>
                </div>
            </header>
            
            <main class="container">
                <!-- Summary Overview Board -->
                <div style="margin-bottom: 24px;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 12px;">
                        <!-- Running count -->
                        <div style="background-color: var(--bg-card); border: 2px solid var(--border-color); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-soft);">
                            <div style="font-size: 14px; color: var(--text-secondary); font-weight: 600;">Running Work</div>
                            <div style="font-size: 26px; font-weight: 800; color: var(--color-primary); margin-top: 4px;">${runningCount}</div>
                        </div>
                        
                        <!-- Completed count -->
                        <div style="background-color: var(--bg-card); border: 2px solid var(--border-color); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-soft);">
                            <div style="font-size: 14px; color: var(--text-secondary); font-weight: 600;">Finished Work</div>
                            <div style="font-size: 26px; font-weight: 800; color: var(--color-completed-text); margin-top: 4px;">${completedCount}</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                        <!-- Money to Receive -->
                        <div style="background-color: #EBF5FB; border: 2px solid #5DADE2; border-radius: 12px; padding: 16px; box-shadow: var(--shadow-soft);">
                            <div style="font-size: 14px; color: #2980B9; font-weight: 600;">To Receive</div>
                            <div style="font-size: 22px; font-weight: 800; color: #1B4F72; margin-top: 4px;">${formatPrice(totalToReceive)}</div>
                        </div>
                        
                        <!-- Own money invested -->
                        <div style="background-color: ${totalOwnMoney > 0 ? 'var(--color-danger-bg)' : 'var(--bg-card)'}; border: 2px solid ${totalOwnMoney > 0 ? 'var(--color-danger-text)' : 'var(--border-color)'}; border-radius: 12px; padding: 16px; box-shadow: var(--shadow-soft);">
                            <div style="font-size: 14px; color: ${totalOwnMoney > 0 ? 'var(--color-danger-text)' : 'var(--text-secondary)'}; font-weight: 600;">Own Money</div>
                            <div style="font-size: 22px; font-weight: 800; color: ${totalOwnMoney > 0 ? 'var(--color-danger-text)' : 'var(--text-primary)'}; margin-top: 4px;">${formatPrice(totalOwnMoney)}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Search and Filter Panel -->
                <div style="margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px;">
                    <!-- Search Input Box -->
                    <div style="position: relative;">
                        <input type="text" id="search-input" value="" placeholder="Search by project or client..." style="width: 100%; height: 54px; padding: 0 16px; border: 2.5px solid var(--border-color); border-radius: 12px; font-size: 18px; font-weight: 500; background-color: var(--bg-card); color: var(--text-primary); outline: none; box-shadow: var(--shadow-soft);" />
                    </div>
                    
                    <!-- Segmented Status Filter Control -->
                    <div class="segmented-control" id="status-filter">
                        <div class="segmented-option">
                            <input type="radio" id="filter-all" name="status-filter" value="All" checked>
                            <label class="segmented-label" for="filter-all">All Projects</label>
                        </div>
                        <div class="segmented-option status-running">
                            <input type="radio" id="filter-running" name="status-filter" value="Running">
                            <label class="segmented-label" for="filter-running">Running</label>
                        </div>
                        <div class="segmented-option status-completed">
                            <input type="radio" id="filter-completed" name="status-filter" value="Completed">
                            <label class="segmented-label" for="filter-completed">Completed</label>
                        </div>
                    </div>
                </div>
                
                <!-- Project Lists Container -->
                <div id="dashboard-lists-container"></div>
            </main>
            
            <!-- Sticky Bottom Button Bar for Easy Reach -->
            <div class="floating-action-container">
                <a href="#/add" class="btn btn-primary" id="add-project-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add New Project
                </a>
            </div>
        `;
    },
    
    init: () => {
        const renderList = () => {
            const projects = getProjects();
            const container = document.getElementById('dashboard-lists-container');
            if (!container) return;
            
            const query = searchQuery.toLowerCase().trim();
            
            // Filter all projects first
            const matchedProjects = projects.filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(query) || (p.client && p.client.toLowerCase().includes(query));
                const matchesStatus = filterValue === 'All' || p.status === filterValue;
                return matchesSearch && matchesStatus;
            });
            
            const runningProjects = matchedProjects.filter(p => p.status === 'Running');
            const completedProjects = matchedProjects.filter(p => p.status === 'Completed');
            
            const renderProjectCard = (proj) => {
                const payments = proj.payments || [];
                const expenses = proj.expenses || [];
                
                const received = payments.reduce((sum, p) => sum + p.amount, 0);
                const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
                
                const remaining = Math.max(0, proj.amount - received);
                const ownPocket = Math.max(0, spent - received);
                
                const badgeClass = proj.status === 'Running' ? 'badge-running' : 'badge-completed';
                const statusClass = proj.status === 'Running' ? 'status-running' : 'status-completed';
                
                return `
                    <a href="#/project/${proj.id}" class="project-card ${statusClass}" style="padding: 20px; display: block; text-decoration: none; color: inherit; margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 14px;">
                            <div>
                                <div style="font-size: 24px; font-weight: 700; color: var(--text-primary); line-height: 1.2;">${escapeHtml(proj.name)}</div>
                                <div style="font-size: 16px; color: var(--text-secondary); margin-top: 4px;">
                                    Client: <strong>${proj.client ? escapeHtml(proj.client) : '<i>None</i>'}</strong>
                                </div>
                            </div>
                            <span class="badge ${badgeClass}">${proj.status}</span>
                        </div>
                        
                        <!-- Financial breakdown 2x2 grid inside card -->
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; border-top: 1px solid var(--border-color); padding-top: 14px;">
                            <div style="font-size: 16px; color: var(--text-secondary);">
                                Price: <strong style="color: var(--text-primary);">${formatPrice(proj.amount)}</strong>
                            </div>
                            <div style="font-size: 16px; color: var(--text-secondary);">
                                Expenses: <strong style="color: ${spent > 0 ? 'var(--color-danger-text)' : 'var(--text-primary)'};">${formatPrice(spent)}</strong>
                            </div>
                            <div style="font-size: 16px; color: var(--text-secondary);">
                                Received: <strong style="color: ${received > 0 ? 'var(--color-running-text)' : 'var(--text-primary)'};">${formatPrice(received)}</strong>
                            </div>
                            <div style="font-size: 16px; color: var(--text-secondary);">
                                Own Money: <strong style="color: ${ownPocket > 0 ? 'var(--color-danger-text)' : 'var(--text-primary)'};">${formatPrice(ownPocket)}</strong>
                            </div>
                        </div>
                        
                        <!-- Remaining debt alert inside card -->
                        <div style="margin-top: 10px; border-top: 1px dashed var(--border-color); padding-top: 8px; font-size: 16px; font-weight: 600; color: ${remaining > 0 ? '#2980B9' : 'var(--text-secondary)'};">
                            Remaining: ${formatPrice(remaining)}
                        </div>
                    </a>
                `;
            };

            // Generate running list
            let runningHtml = '<h2 class="mb-4">Running Projects</h2>';
            if (runningProjects.length === 0) {
                runningHtml += `
                    <div style="padding: 40px 20px; border: 2px dashed var(--border-color); border-radius: var(--border-radius); text-align: center; margin-bottom: 32px; background-color: var(--bg-card);">
                        <p style="font-size: 18px; color: var(--text-secondary);">No running projects found</p>
                    </div>
                `;
            } else {
                runningHtml += `
                    <div style="margin-bottom: 32px;">
                        ${runningProjects.map(p => renderProjectCard(p)).join('')}
                    </div>
                `;
            }
            
            // Generate completed list inside collapsible details section
            const autoOpenCompleted = query.length > 0 || filterValue === 'Completed';
            const completedListHtml = completedProjects.length === 0 
                ? `<div style="padding: 30px; text-align: center; background-color: var(--bg-card); border-radius: 12px;"><p style="font-size: 18px; color: var(--text-secondary);">No completed projects found</p></div>`
                : completedProjects.map(p => renderProjectCard(p)).join('');
                
            const completedHtml = `
                <details class="collapsible-details" ${autoOpenCompleted ? 'open' : ''} style="background-color: var(--bg-card); border: 2px solid var(--border-color); border-radius: var(--border-radius); box-shadow: var(--shadow-soft); overflow: hidden; margin-bottom: 24px;">
                    <summary class="collapsible-summary" style="font-size: 20px; font-weight: 700; padding: 18px 24px; cursor: pointer; user-select: none; background-color: #F8F9FA; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                        <span>Completed Projects (${completedProjects.length})</span>
                    </summary>
                    <div style="padding: 16px 12px 4px 12px; background-color: var(--bg-primary); border-top: 1px solid var(--border-color);">
                        ${completedListHtml}
                    </div>
                </details>
            `;
            
            container.innerHTML = runningHtml + completedHtml;
        };

        // Helper to escape HTML tags to prevent XSS and rendering issues
        function escapeHtml(str) {
            return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        // Attach event listeners
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                renderList();
            });
        }
        
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                if (e.target.name === 'status-filter') {
                    filterValue = e.target.value;
                    renderList();
                }
            });
        }

        // Render project lists initially
        renderList();
    }
};
