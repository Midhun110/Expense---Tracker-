import { getProjects } from '../state.js';

function formatPrice(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export const ReportsView = {
    render: () => {
        const projects = getProjects();
        
        let totalRevenue = 0;
        let totalReceived = 0;
        let totalExpenses = 0;
        
        const categoryMap = {};
        
        projects.forEach(p => {
            const pDiscount = parseFloat(p.discount) || 0;
            const pFinalAmount = Math.max(0, (p.amount || 0) - pDiscount);
            totalRevenue += pFinalAmount;
            
            (p.payments || []).forEach(pay => {
                totalReceived += pay.amount;
            });
            
            (p.expenses || []).forEach(exp => {
                totalExpenses += exp.amount;
                const cat = exp.category || 'Other';
                categoryMap[cat] = (categoryMap[cat] || 0) + exp.amount;
            });
        });
        
        const profit = Math.max(0, totalReceived - totalExpenses);
        
        // Render category rows
        const categoryRows = Object.keys(categoryMap).map(cat => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1.5px solid var(--border-color);">
                <span style="font-size: 18px; font-weight: 600; color: var(--text-secondary);">${cat}</span>
                <span style="font-size: 18px; font-weight: 700; color: var(--color-danger-text);">${formatPrice(categoryMap[cat])}</span>
            </div>
        `).join('') || `<div style="text-align: center; color: var(--text-secondary); padding: 16px 0;">No expenses logged yet</div>`;

        return `
            <header class="app-header" style="background-color: var(--bg-card); padding: 20px 24px; border-bottom: 2px solid var(--border-color);">
                <span class="app-title">Business Reports</span>
            </header>
            
            <main class="container" style="padding-bottom: 30px;">
                <h2 class="mb-4" style="font-size: 22px; font-weight: 700; color: var(--text-primary);">Financial Summary</h2>
                
                <!-- Balance Card -->
                <div style="background-color: var(--color-primary); color: #FFFFFF; border-radius: 20px; padding: 24px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(211, 84, 0, 0.2);">
                    <div style="font-size: 16px; opacity: 0.85; font-weight: 600;">Net Balance (Received - Spent)</div>
                    <div style="font-size: 34px; font-weight: 800; margin-top: 8px;">${formatPrice(profit)}</div>
                </div>
                
                <!-- Financial Cards Grid -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
                    <div style="background-color: #FFFFFF; border: 2px solid var(--border-color); border-radius: 16px; padding: 16px; box-shadow: var(--shadow-soft);">
                        <div style="font-size: 14px; color: var(--text-secondary); font-weight: 600;">Total Business</div>
                        <div style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-top: 4px;">${formatPrice(totalRevenue)}</div>
                    </div>
                    
                    <div style="background-color: #FFFFFF; border: 2px solid var(--border-color); border-radius: 16px; padding: 16px; box-shadow: var(--shadow-soft);">
                        <div style="font-size: 14px; color: var(--text-secondary); font-weight: 600;">Total Collected</div>
                        <div style="font-size: 22px; font-weight: 800; color: var(--color-running-text); margin-top: 4px;">${formatPrice(totalReceived)}</div>
                    </div>
                    
                    <div style="background-color: #FFFFFF; border: 2px solid var(--border-color); border-radius: 16px; padding: 16px; box-shadow: var(--shadow-soft); grid-column: span 2;">
                        <div style="font-size: 14px; color: var(--text-secondary); font-weight: 600;">Total Expenses</div>
                        <div style="font-size: 22px; font-weight: 800; color: var(--color-danger-text); margin-top: 4px;">${formatPrice(totalExpenses)}</div>
                    </div>
                </div>
                
                <!-- Expenses Breakdown -->
                <div style="background-color: #FFFFFF; border: 2px solid var(--border-color); border-radius: 16px; padding: 20px; box-shadow: var(--shadow-soft);">
                    <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 16px; color: var(--text-primary);">Expenses by Category</h3>
                    <div>
                        ${categoryRows}
                    </div>
                </div>
            </main>
        `;
    },
    init: () => {}
};
