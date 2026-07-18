import { addProject } from '../state.js';
import { navigate } from '../router.js';

export const ProjectAddView = {
    render: () => {
        // Default date string formatted as YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        
        return `
            <header class="app-header">
                <button class="btn-back" id="btn-cancel-add">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back
                </button>
                <span class="app-title">New Project</span>
            </header>
            
            <main class="container">
                <h1 class="mb-6">Add New Project</h1>
                
                <form id="add-project-form" novalidate>
                    <!-- Error Box (hidden by default) -->
                    <div id="form-error" class="badge badge-completed" style="background-color: var(--color-danger-bg); color: var(--color-danger-text); border: 2px solid var(--color-danger-text); display: none; width: 100%; margin-bottom: 24px; border-radius: 12px; font-weight: 700; text-align: left; padding: 16px;">
                        Please enter a Project Name.
                    </div>
                
                    <!-- Project Name -->
                    <div class="form-group">
                        <label class="form-label" for="proj-name">Project Name <span style="color: var(--color-danger-text);">*</span></label>
                        <input type="text" id="proj-name" class="form-control" placeholder="e.g. Wardrobe, Kitchen Cupboards" required>
                    </div>
                    
                    <!-- Client Name -->
                    <div class="form-group">
                        <label class="form-label" for="proj-client">Client Name</label>
                        <input type="text" id="proj-client" class="form-control" placeholder="e.g. Ramesh Kumar">
                    </div>
                    
                    <!-- Price/Amount -->
                    <div class="form-group">
                        <label class="form-label" for="proj-amount">Contract Price (₹)</label>
                        <input type="number" id="proj-amount" class="form-control" placeholder="e.g. 35000" inputmode="numeric" min="0" pattern="[0-9]*">
                    </div>
                    
                    <!-- Start Date -->
                    <div class="form-group">
                        <label class="form-label" for="proj-date">Start Date</label>
                        <input type="date" id="proj-date" class="form-control" value="${today}">
                    </div>
                    
                    <!-- Status Segmented Toggle -->
                    <div class="form-group mb-6">
                        <label class="form-label">Status</label>
                        <div class="segmented-control">
                            <div class="segmented-option status-running">
                                <input type="radio" id="status-running" name="status" value="Running" checked>
                                <label class="segmented-label" for="status-running">Running</label>
                            </div>
                            <div class="segmented-option status-completed">
                                <input type="radio" id="status-completed" name="status" value="Completed">
                                <label class="segmented-label" for="status-completed">Completed</label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Form Actions -->
                    <div style="margin-top: 40px; display: flex; flex-direction: column; gap: 16px;">
                        <button type="submit" class="btn btn-primary" id="btn-save-project">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            Save Project
                        </button>
                        <button type="button" class="btn btn-secondary" id="btn-cancel-form">
                            Cancel
                        </button>
                    </div>
                </form>
            </main>
        `;
    },
    
    init: () => {
        const form = document.getElementById('add-project-form');
        const errorBox = document.getElementById('form-error');
        const cancelBtn = document.getElementById('btn-cancel-form');
        const headerBackBtn = document.getElementById('btn-cancel-add');
        
        // Navigation back functions
        const goBack = () => {
            navigate('/');
        };
        
        cancelBtn.addEventListener('click', goBack);
        headerBackBtn.addEventListener('click', goBack);
        
        // Handle Submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('proj-name').value;
            const client = document.getElementById('proj-client').value;
            const amount = document.getElementById('proj-amount').value;
            const startDate = document.getElementById('proj-date').value;
            
            // Get selected radio value
            const statusElement = document.querySelector('input[name="status"]:checked');
            const status = statusElement ? statusElement.value : 'Running';
            
            // Validate name (required)
            if (!name.trim()) {
                errorBox.style.display = 'block';
                window.scrollTo(0, 0); // Scroll to error box
                return;
            }
            
            errorBox.style.display = 'none';
            
            // Add Project through State manager
            addProject({
                name,
                client,
                amount,
                startDate,
                status
            });
            
            // Redirect to home dashboard
            navigate('/');
        });
    }
};
