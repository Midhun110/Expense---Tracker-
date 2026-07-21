import { initRouter } from './js/router.js';
import { DashboardView } from './js/views/dashboard.js';
import { ProjectAddView } from './js/views/project-add.js';
import { ProjectDetailsView } from './js/views/project-details.js';
import { ProjectEditView } from './js/views/project-edit.js';
import { PaymentAddView } from './js/views/payment-add.js';
import { PaymentEditView } from './js/views/payment-edit.js';
import { ExpenseAddView } from './js/views/expense-add.js';
import { ExpenseEditView } from './js/views/expense-edit.js';
import { ProjectsListView } from './js/views/projects-list.js';
import { ReportsView } from './js/views/reports.js';
import { MoreView } from './js/views/more.js';
import { getProjects } from './js/state.js';

// Define the application routes map
const routes = {
    '/': DashboardView,
    '/projects': ProjectsListView,
    '/reports': ReportsView,
    '/more': MoreView,
    '/add': ProjectAddView,
    '/project/:id': ProjectDetailsView,
    '/project/:id/edit': ProjectEditView,
    '/project/:id/payment/add': PaymentAddView,
    '/project/:id/payment/:paymentId/edit': PaymentEditView,
    '/project/:id/expense/add': ExpenseAddView,
    '/project/:id/expense/:expenseId/edit': ExpenseEditView
};

// Bootstrap the SPA when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initRouter(routes, 'app');
    
    // Bottom Sheet & FAB Controllers
    const fab = document.getElementById('global-fab');
    const backdrop = document.getElementById('bottom-sheet-backdrop');
    const sheet = document.getElementById('bottom-sheet');
    const closeBtn = document.getElementById('btn-close-sheet');
    const mainContent = document.getElementById('sheet-content-main');
    const selectorContent = document.getElementById('sheet-content-project-selector');
    const selectorList = document.getElementById('project-selector-list');
    const selectorBack = document.getElementById('btn-action-selector-back');
    const titleText = document.getElementById('sheet-title-text');
    
    if (!fab || !backdrop || !sheet) return;

    // Toggle bottom navigation active status and overall visibility
    const updateBottomNav = () => {
        const hash = window.location.hash || '#/';
        const basePath = hash.split('?')[0];

        const navItems = {
            '#/': document.getElementById('nav-home'),
            '#/projects': document.getElementById('nav-projects'),
            '#/reports': document.getElementById('nav-reports'),
            '#/more': document.getElementById('nav-more')
        };
        
        Object.values(navItems).forEach(el => {
            if (el) el.classList.remove('active');
        });
        
        if (navItems[basePath]) {
            navItems[basePath].classList.add('active');
        }
        
        const isMainTab = basePath === '#/' || basePath === '#' || basePath === '' || basePath === '#/projects' || basePath === '#/reports' || basePath === '#/more';
        
        if (isMainTab) {
            document.body.classList.remove('bottom-nav-hidden');
        } else {
            document.body.classList.add('bottom-nav-hidden');
        }
    };
    
    // Toggle FAB visibility based on the SPA route hash
    const updateFabVisibility = () => {
        const hash = window.location.hash || '#/';
        const isDetails = hash.startsWith('#/project/') && !hash.endsWith('/edit') && !hash.includes('/payment/') && !hash.includes('/expense/');
        
        if (isDetails) {
            fab.classList.remove('fab-hidden');
        } else {
            fab.classList.add('fab-hidden');
        }
    };
    
    window.addEventListener('hashchange', () => {
        updateBottomNav();
        updateFabVisibility();
    });
    window.addEventListener('hashchange', closeSheet); // Auto-close sheet on route change
    
    updateBottomNav();
    updateFabVisibility();

    // Sheet toggles
    function openSheet() {
        mainContent.style.display = 'flex';
        selectorContent.style.display = 'none';
        titleText.textContent = 'Quick Actions';
        
        sheet.classList.add('active');
        backdrop.classList.add('active');
    }
    
    function closeSheet() {
        sheet.classList.remove('active');
        backdrop.classList.remove('active');
    }
    
    fab.addEventListener('click', openSheet);
    backdrop.addEventListener('click', closeSheet);
    closeBtn.addEventListener('click', closeSheet);

    // Bind action navigation buttons
    document.getElementById('btn-action-new-project').addEventListener('click', () => {
        closeSheet();
        window.location.hash = '#/add';
    });

    const handleContextAction = (actionType) => {
        const hash = window.location.hash || '#/';
        const isDetails = hash.startsWith('#/project/') && !hash.endsWith('/edit') && !hash.includes('/payment/') && !hash.includes('/expense/');
        
        if (isDetails) {
            // Context-aware: directly extract project ID from details route and navigate
            const parts = hash.split('/');
            const projectId = parts[2];
            closeSheet();
            if (actionType === 'expense') {
                window.location.hash = `#/project/${projectId}/expense/add`;
            } else {
                window.location.hash = `#/project/${projectId}/payment/add`;
            }
        } else {
            // Dashboard context: open project picker first
            showProjectSelector(actionType);
        }
    };

    document.getElementById('btn-action-add-expense').addEventListener('click', () => handleContextAction('expense'));
    document.getElementById('btn-action-receive-payment').addEventListener('click', () => handleContextAction('payment'));

    // Render list inside Project Selector panel
    const showProjectSelector = (actionType) => {
        const projects = getProjects().filter(p => p.status === 'Running');
        titleText.textContent = actionType === 'expense' ? 'Record Expense' : 'Receive Payment';
        
        if (projects.length === 0) {
            selectorList.innerHTML = `
                <div style="padding: 24px; text-align: center; color: var(--text-secondary); font-weight: 500; font-size: 18px;">
                    No running projects found.
                </div>
            `;
        } else {
            selectorList.innerHTML = projects.map(p => `
                <button class="btn btn-secondary" style="height: 60px; font-size: 18px; font-weight: 600; text-align: left; padding-left: 20px; justify-content: flex-start; border: 2px solid var(--border-color); background-color: var(--bg-card); color: var(--text-primary);" data-id="${p.id}">
                    📁 ${escapeHtml(p.name)}
                </button>
            `).join('');
            
            Array.from(selectorList.children).forEach(btn => {
                btn.addEventListener('click', () => {
                    const projectId = btn.getAttribute('data-id');
                    closeSheet();
                    if (actionType === 'expense') {
                        window.location.hash = `#/project/${projectId}/expense/add`;
                    } else {
                        window.location.hash = `#/project/${projectId}/payment/add`;
                    }
                });
            });
        }
        
        mainContent.style.display = 'none';
        selectorContent.style.display = 'flex';
    };

    selectorBack.addEventListener('click', () => {
        selectorContent.style.display = 'none';
        mainContent.style.display = 'flex';
        titleText.textContent = 'Quick Actions';
    });

    // Helper to escape HTML strings inside templates
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
