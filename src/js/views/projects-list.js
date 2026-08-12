import { getProjects } from '../state.js';

let searchQuery = '';
let filterValue = 'All';

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

export const ProjectsListView = {
    render: () => {
        searchQuery = '';
        filterValue = 'All';
        
        return `
            <header class="app-header" style="background-color: var(--bg-card); padding: 20px 24px; border-bottom: 2px solid var(--border-color);">
                <span class="app-title">All Projects</span>
            </header>
            
            <main class="container" style="padding-bottom: 30px;">
                <!-- Search & Filters -->
                <div style="margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px;">
                    <div style="position: relative; display: flex; align-items: center;">
                        <span style="position: absolute; left: 16px; font-size: 22px; color: var(--text-secondary);">🔍</span>
                        <input type="text" id="projects-search" placeholder="Search customer or project..." style="width: 100%; height: 60px; padding: 0 16px 0 50px; border: 2.5px solid var(--border-color); border-radius: 16px; font-size: 18px; font-weight: 600; background-color: #FFFFFF; color: var(--text-primary); outline: none; box-shadow: var(--shadow-soft);" />
                    </div>
                    
                    <div class="segmented-control" id="projects-filter">
                        <div class="segmented-option">
                            <input type="radio" id="filter-all" name="projects-filter" value="All" checked>
                            <label class="segmented-label" for="filter-all">All</label>
                        </div>
                        <div class="segmented-option status-running">
                            <input type="radio" id="filter-running" name="projects-filter" value="Running">
                            <label class="segmented-label" for="filter-running">Running</label>
                        </div>
                        <div class="segmented-option status-completed">
                            <input type="radio" id="filter-completed" name="projects-filter" value="Completed">
                            <label class="segmented-label" for="filter-completed">Completed</label>
                        </div>
                    </div>
                </div>
                
                <div id="projects-list-container"></div>
            </main>
        `;
    },
    
    init: () => {
        const renderList = () => {
            const projects = getProjects();
            const container = document.getElementById('projects-list-container');
            if (!container) return;
            
            const query = searchQuery.toLowerCase().trim();
            const filtered = projects.filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(query) || (p.client && p.client.toLowerCase().includes(query));
                const matchesStatus = filterValue === 'All' || p.status === filterValue;
                return matchesSearch && matchesStatus;
            });
            
            if (filtered.length === 0) {
                container.innerHTML = `
                    <div style="padding: 40px 20px; border: 2px dashed var(--border-color); border-radius: 16px; text-align: center; background-color: #FFFFFF;">
                        <p style="font-size: 18px; color: var(--text-secondary);">No projects found</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = filtered.map(proj => {
                const payments = proj.payments || [];
                const received = payments.reduce((sum, pay) => sum + pay.amount, 0);
                const projDiscount = parseFloat(proj.discount) || 0;
                const projFinalAmount = Math.max(0, (proj.amount || 0) - projDiscount);
                const remaining = Math.max(0, projFinalAmount - received);
                
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
                        
                        <div style="font-size: 16px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px;">
                            <div>Project: <strong>${escapeHtml(proj.name)}</strong></div>
                            <div>Phone: <strong>${proj.phone ? escapeHtml(proj.phone) : '<i>Not set</i>'}</strong></div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 14px;">
                            <div style="font-size: 18px; font-weight: 700; color: ${remaining > 0 ? '#2980B9' : 'var(--text-secondary)'};">
                                ${formatPrice(remaining)} Remaining
                            </div>
                            <a href="#/project/${proj.id}" class="btn-open-project" style="display: flex; align-items: center; justify-content: center; background-color: var(--color-primary-light); color: var(--color-primary); text-decoration: none; padding: 10px 20px; border-radius: 12px; font-size: 16px; font-weight: 700; gap: 6px; box-shadow: var(--shadow-soft);">
                                ▶ Open
                            </a>
                        </div>
                    </div>
                `;
            }).join('');
        };
        
        const searchInput = document.getElementById('projects-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                renderList();
            });
            if (window.location.hash.includes('focusSearch=true')) {
                searchInput.focus();
            }
        }
        
        const filterControl = document.getElementById('projects-filter');
        if (filterControl) {
            filterControl.addEventListener('change', (e) => {
                if (e.target.name === 'projects-filter') {
                    filterValue = e.target.value;
                    renderList();
                }
            });
        }
        
        renderList();
    }
};
