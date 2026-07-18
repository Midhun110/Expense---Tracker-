const STORAGE_KEY = 'easy_projects_data';

if (window.location.search.includes('reset=true') || window.location.hash.includes('reset=true')) {
    localStorage.removeItem(STORAGE_KEY);
    let cleanUrl = window.location.origin + window.location.pathname;
    if (window.location.hash) {
        cleanUrl += window.location.hash.replace(/[?&]reset=true/, '').replace('#&', '#');
    }
    window.location.href = cleanUrl;
}

// Initial mock data so the app doesn't look blank on first load
const MOCK_PROJECTS = [
    {
        id: 'mock-1',
        name: 'Kitchen Cabinets',
        client: 'Ramesh Sharma',
        amount: 45000,
        startDate: new Date().toISOString().split('T')[0], // Today
        status: 'Running',
        payments: [
            {
                id: 'mock-pay-1',
                amount: 15000,
                date: new Date().toISOString().split('T')[0],
                note: 'Initial advance'
            }
        ],
        expenses: [
            {
                id: 'mock-exp-1',
                category: 'Materials',
                amount: 12000,
                date: new Date().toISOString().split('T')[0],
                note: 'Bought plywood'
            }
        ],
        activityLog: [
            {
                id: 'mock-act-1',
                type: 'payment_received',
                timestamp: Date.now() - 3600000 * 2, // 2 hours ago
                amount: 15000,
                note: 'Initial advance'
            },
            {
                id: 'mock-act-2',
                type: 'expense_added',
                timestamp: Date.now() - 3600000, // 1 hour ago
                amount: 12000,
                category: 'Materials',
                note: 'Bought plywood'
            }
        ]
    },
    {
        id: 'mock-2',
        name: 'Oak Wardrobe',
        client: 'Suresh Patel',
        amount: 28000,
        startDate: '2026-06-15',
        status: 'Completed',
        payments: [],
        expenses: [],
        activityLog: []
    }
];

export function getProjects() {
    const data = localStorage.getItem(STORAGE_KEY);
    let projects;
    if (!data) {
        // Seed mock data
        projects = MOCK_PROJECTS;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } else {
        projects = JSON.parse(data);
    }
    
    // Ensure all projects have payments, expenses and activityLog array initialized (migration step)
    let updated = false;
    projects.forEach(p => {
        if (!p.payments) {
            p.payments = [];
            updated = true;
        }
        if (!p.expenses) {
            p.expenses = [];
            updated = true;
        }
        if (!p.activityLog || p.activityLog.length === 0) {
            if (p.id === 'mock-1') {
                p.activityLog = [
                    {
                        id: 'mock-act-1',
                        type: 'payment_received',
                        timestamp: Date.now() - 3600000 * 2, // 2 hours ago
                        amount: 15000,
                        note: 'Initial advance'
                    },
                    {
                        id: 'mock-act-2',
                        type: 'expense_added',
                        timestamp: Date.now() - 3600000, // 1 hour ago
                        amount: 12000,
                        category: 'Materials',
                        note: 'Bought plywood'
                    }
                ];
            } else {
                p.activityLog = [];
            }
            updated = true;
        }
    });
    if (updated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
    
    return projects;
}

export function getProject(id) {
    const projects = getProjects();
    return projects.find(p => p.id === id) || null;
}

export function addProject(projectData) {
    const projects = getProjects();
    const newProject = {
        id: 'proj-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        name: projectData.name.trim(),
        client: (projectData.client || '').trim(),
        amount: parseFloat(projectData.amount) || 0,
        startDate: projectData.startDate || new Date().toISOString().split('T')[0],
        status: projectData.status || 'Running',
        payments: [],
        expenses: [],
        activityLog: []
    };
    
    projects.unshift(newProject); // Add to the top of the list
    saveProjects(projects);
    return newProject;
}

export function updateProject(id, updatedData) {
    const projects = getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    projects[index] = {
        ...projects[index],
        name: updatedData.name.trim(),
        client: (updatedData.client || '').trim(),
        amount: parseFloat(updatedData.amount) || 0,
        startDate: updatedData.startDate || projects[index].startDate,
        status: updatedData.status || projects[index].status
    };
    
    saveProjects(projects);
    return projects[index];
}

export function deleteProject(id) {
    const projects = getProjects();
    const filtered = projects.filter(p => p.id !== id);
    saveProjects(filtered);
    return true;
}

// Payment CRUD Functions
export function addPayment(projectId, paymentData) {
    const projects = getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    
    const newPayment = {
        id: 'pay-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        amount: parseFloat(paymentData.amount) || 0,
        date: paymentData.date || new Date().toISOString().split('T')[0],
        note: (paymentData.note || '').trim()
    };
    
    project.payments.push(newPayment);
    
    // Log Activity
    const logEntry = {
        id: 'act-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        type: 'payment_received',
        timestamp: Date.now(),
        amount: newPayment.amount,
        note: newPayment.note
    };
    project.activityLog = project.activityLog || [];
    project.activityLog.push(logEntry);
    
    saveProjects(projects);
    return newPayment;
}

export function updatePayment(projectId, paymentId, updatedData) {
    const projects = getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    
    const index = project.payments.findIndex(pay => pay.id === paymentId);
    if (index === -1) return null;
    
    project.payments[index] = {
        ...project.payments[index],
        amount: parseFloat(updatedData.amount) || 0,
        date: updatedData.date || project.payments[index].date,
        note: (updatedData.note || '').trim()
    };
    
    // Log Activity
    const logEntry = {
        id: 'act-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        type: 'payment_edited',
        timestamp: Date.now(),
        amount: project.payments[index].amount,
        note: project.payments[index].note
    };
    project.activityLog = project.activityLog || [];
    project.activityLog.push(logEntry);
    
    saveProjects(projects);
    return project.payments[index];
}

export function deletePayment(projectId, paymentId) {
    const projects = getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;
    
    project.payments = project.payments.filter(pay => pay.id !== paymentId);
    saveProjects(projects);
    return true;
}

// Expense CRUD Functions
export function addExpense(projectId, expenseData) {
    const projects = getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    
    const newExpense = {
        id: 'exp-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        category: expenseData.category,
        amount: parseFloat(expenseData.amount) || 0,
        date: expenseData.date || new Date().toISOString().split('T')[0],
        note: (expenseData.note || '').trim()
    };
    
    project.expenses.push(newExpense);
    
    // Log Activity
    const logEntry = {
        id: 'act-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        type: 'expense_added',
        timestamp: Date.now(),
        amount: newExpense.amount,
        category: newExpense.category,
        note: newExpense.note
    };
    project.activityLog = project.activityLog || [];
    project.activityLog.push(logEntry);
    
    saveProjects(projects);
    return newExpense;
}

export function updateExpense(projectId, expenseId, updatedData) {
    const projects = getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    
    const index = project.expenses.findIndex(exp => exp.id === expenseId);
    if (index === -1) return null;
    
    project.expenses[index] = {
        ...project.expenses[index],
        category: updatedData.category,
        amount: parseFloat(updatedData.amount) || 0,
        date: updatedData.date || project.expenses[index].date,
        note: (updatedData.note || '').trim()
    };
    
    // Log Activity
    const logEntry = {
        id: 'act-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        type: 'expense_edited',
        timestamp: Date.now(),
        amount: project.expenses[index].amount,
        category: project.expenses[index].category,
        note: project.expenses[index].note
    };
    project.activityLog = project.activityLog || [];
    project.activityLog.push(logEntry);
    
    saveProjects(projects);
    return project.expenses[index];
}

export function deleteExpense(projectId, expenseId) {
    const projects = getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;
    
    project.expenses = project.expenses.filter(exp => exp.id !== expenseId);
    saveProjects(projects);
    return true;
}

function saveProjects(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

