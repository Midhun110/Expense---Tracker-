import { getProject, updateProject } from '../state.js';
import { navigate } from '../router.js';

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export const ProjectEditView = {
    render: (params) => {
        const project = getProject(params.id);
        
        if (!project) {
            return `
                <header class="app-header">
                    <button class="btn-back" id="btn-cancel-edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back
                    </button>
                    <span class="app-title">Edit Project</span>
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
        
        return `
            <header class="app-header">
                <button class="btn-back" id="btn-cancel-edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Cancel
                </button>
                <span class="app-title">Edit Project</span>
            </header>
            
            <main class="container">
                <h1 class="mb-6">Edit Details</h1>
                
                <form id="edit-project-form" novalidate>
                    <!-- Error Box (hidden by default) -->
                    <div id="form-error" class="badge badge-completed" style="background-color: var(--color-danger-bg); color: var(--color-danger-text); border: 2px solid var(--color-danger-text); display: none; width: 100%; margin-bottom: 24px; border-radius: 12px; font-weight: 700; text-align: left; padding: 16px;">
                        Please enter a Project Name.
                    </div>
                
                    <!-- Project Name -->
                    <div class="form-group">
                        <label class="form-label" for="proj-name">Project Name <span style="color: var(--color-danger-text);">*</span></label>
                        <input type="text" id="proj-name" class="form-control" value="${escapeHtml(project.name)}" placeholder="e.g. Wardrobe, Kitchen Cupboards" required>
                    </div>
                    
                    <!-- Client Name -->
                    <div class="form-group">
                        <label class="form-label" for="proj-client">Client Name</label>
                        <input type="text" id="proj-client" class="form-control" value="${escapeHtml(project.client || '')}" placeholder="e.g. Ramesh Kumar">
                    </div>
                    
                    <!-- Price/Amount -->
                    <div class="form-group">
                        <label class="form-label" for="proj-amount">Contract Price (₹)</label>
                        <input type="number" id="proj-amount" class="form-control" value="${project.amount}" placeholder="e.g. 35000" inputmode="numeric" min="0" pattern="[0-9]*">
                    </div>
                    
                    <!-- Start Date -->
                    <div class="form-group">
                        <label class="form-label" for="proj-date">Start Date</label>
                        <input type="date" id="proj-date" class="form-control" value="${project.startDate}">
                    </div>
                    
                    <!-- Status Segmented Toggle -->
                    <div class="form-group mb-6">
                        <label class="form-label">Status</label>
                        <div class="segmented-control">
                            <div class="segmented-option status-running">
                                <input type="radio" id="status-running" name="status" value="Running" ${project.status === 'Running' ? 'checked' : ''}>
                                <label class="segmented-label" for="status-running">Running</label>
                            </div>
                            <div class="segmented-option status-completed">
                                <input type="radio" id="status-completed" name="status" value="Completed" ${project.status === 'Completed' ? 'checked' : ''}>
                                <label class="segmented-label" for="status-completed">Completed</label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Form Actions -->
                    <div style="margin-top: 40px; display: flex; flex-direction: column; gap: 16px;">
                        <button type="submit" class="btn btn-primary" id="btn-save-project">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Save Changes
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
        
        const form = document.getElementById('edit-project-form');
        const errorBox = document.getElementById('form-error');
        const cancelBtn = document.getElementById('btn-cancel-form');
        const headerCancelBtn = document.getElementById('btn-cancel-edit');
        
        cancelBtn.addEventListener('click', goBack);
        headerCancelBtn.addEventListener('click', goBack);
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('proj-name').value;
            const client = document.getElementById('proj-client').value;
            const amount = document.getElementById('proj-amount').value;
            const startDate = document.getElementById('proj-date').value;
            
            const statusElement = document.querySelector('input[name="status"]:checked');
            const status = statusElement ? statusElement.value : 'Running';
            
            if (!name.trim()) {
                errorBox.style.display = 'block';
                window.scrollTo(0, 0);
                return;
            }
            
            errorBox.style.display = 'none';
            
            updateProject(project.id, {
                name,
                client,
                amount,
                startDate,
                status
            });
            
            goBack();
        });
    }
};
