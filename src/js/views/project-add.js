import { addProject } from '../state.js';
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

function createRowHtml(index, itemName = '', qty = 1, size = '', price = '') {
    return `
    <div class="product-row" data-index="${index}">
        <div class="product-row-header">
            <span class="product-no">#${index + 1}</span>
            <button type="button" class="btn-delete-item" aria-label="Delete Item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <span>Delete</span>
            </button>
        </div>
        <div class="product-fields-grid">
            <div class="field-item-name">
                <label class="compact-label">Item Name <span style="color: var(--color-danger-text);">*</span></label>
                <input type="text" class="product-input item-name" value="${escapeHtml(itemName)}" placeholder="e.g. Wardrobe, Kitchen Cabinets" autocomplete="off" required>
                <div class="autocomplete-dropdown"></div>
            </div>
            <div class="field-qty">
                <label class="compact-label">Quantity</label>
                <div class="qty-control">
                    <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity">-</button>
                    <input type="text" class="qty-input item-qty" value="${qty}" readonly>
                    <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity">+</button>
                </div>
            </div>
            <div class="field-size">
                <label class="compact-label">Size</label>
                <input type="text" class="product-input item-size" value="${escapeHtml(size)}" placeholder="e.g. 8x4 feet">
            </div>
            <div class="field-price">
                <label class="compact-label">Price (₹) <span style="color: var(--color-danger-text);">*</span></label>
                <input type="number" class="product-input item-price" value="${price}" placeholder="e.g. 15000" min="0" inputmode="numeric" pattern="[0-9]*">
            </div>
        </div>
    </div>
    `;
}

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
                <h1 class="mb-6">Create Quotation / Project</h1>
                
                <form id="add-project-form" novalidate>
                    <!-- Error Box (hidden by default) -->
                    <div id="form-error" class="badge badge-completed" style="background-color: var(--color-danger-bg); color: var(--color-danger-text); border: 2px solid var(--color-danger-text); display: none; width: 100%; margin-bottom: 24px; border-radius: 12px; font-weight: 700; text-align: left; padding: 16px; line-height: 1.4;">
                        Please fix the errors below.
                    </div>
                
                    <!-- Client Name -->
                    <div class="form-group">
                        <label class="form-label" for="proj-client">Client Name <span style="color: var(--color-danger-text);">*</span></label>
                        <input type="text" id="proj-client" class="form-control" placeholder="e.g. Ramesh Kumar" required>
                    </div>

                    <!-- Phone Number -->
                    <div class="form-group">
                        <label class="form-label" for="proj-phone">Phone Number</label>
                        <input type="tel" id="proj-phone" class="form-control" placeholder="e.g. 9876543210">
                    </div>

                    <!-- Site Address -->
                    <div class="form-group">
                        <label class="form-label" for="proj-address">Site Address (Optional)</label>
                        <input type="text" id="proj-address" class="form-control" placeholder="e.g. Flat 402, Green Glen Layout">
                    </div>
                    
                    <!-- Order Date -->
                    <div class="form-group">
                        <label class="form-label" for="proj-date">Order Date <span style="color: var(--color-danger-text);">*</span></label>
                        <input type="date" id="proj-date" class="form-control" value="${today}">
                    </div>

                    <!-- Expected Completion Date -->
                    <div class="form-group">
                        <label class="form-label" for="proj-completion-date">Expected Completion Date (Optional)</label>
                        <input type="date" id="proj-completion-date" class="form-control">
                    </div>

                    <!-- Product Table Section -->
                    <div class="product-table-container">
                        <div class="product-table-title">Product List</div>
                        <div class="desktop-table-header">
                            <div>No.</div>
                            <div>Item Name <span style="color: var(--color-danger-text);">*</span></div>
                            <div style="text-align: center;">Quantity</div>
                            <div>Size</div>
                            <div>Price (₹) <span style="color: var(--color-danger-text);">*</span></div>
                            <div></div>
                        </div>
                        <div id="product-rows-container">
                            <!-- Dynamically loaded rows -->
                        </div>
                        <button type="button" class="btn-add-item" id="btn-add-product-row">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Item
                        </button>
                    </div>

                    <!-- Total Contract Amount Box -->
                    <div class="total-amount-box">
                        <span class="total-amount-label">Total Contract Amount:</span>
                        <span class="total-amount-value" id="total-contract-amount">₹0</span>
                    </div>
                    
                    <!-- Status Toggle -->
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
        const productRowsContainer = document.getElementById('product-rows-container');
        const addProductRowBtn = document.getElementById('btn-add-product-row');
        
        const goBack = () => {
            navigate('/');
        };
        
        cancelBtn.addEventListener('click', goBack);
        headerBackBtn.addEventListener('click', goBack);
        
        // Helper to recalculate indices and total contract amount
        const updateSerialNumbersAndTotal = () => {
            const rows = productRowsContainer.getElementsByClassName('product-row');
            let total = 0;
            
            Array.from(rows).forEach((row, idx) => {
                const noSpan = row.querySelector('.product-no');
                if (noSpan) noSpan.textContent = `#${idx + 1}`;
                row.setAttribute('data-index', idx);
                
                const priceInput = row.querySelector('.item-price');
                const qtyInput = row.querySelector('.item-qty');
                
                const price = parseFloat(priceInput.value) || 0;
                const qty = parseInt(qtyInput.value) || 1;
                total += price * qty;
            });
            
            const totalVal = document.getElementById('total-contract-amount');
            if (totalVal) {
                totalVal.textContent = '₹' + total.toLocaleString('en-IN', { maximumFractionDigits: 0 });
            }
        };

        // Bind events for quantity controls and deletion in a row
        const bindRowEvents = (row) => {
            const deleteBtn = row.querySelector('.btn-delete-item');
            deleteBtn.addEventListener('click', () => {
                row.remove();
                updateSerialNumbersAndTotal();
            });
            
            const qtyInput = row.querySelector('.item-qty');
            const minusBtn = row.querySelector('.qty-minus');
            const plusBtn = row.querySelector('.qty-plus');
            
            minusBtn.addEventListener('click', () => {
                let val = parseInt(qtyInput.value) || 1;
                if (val > 1) {
                    qtyInput.value = val - 1;
                    updateSerialNumbersAndTotal();
                }
            });
            
            plusBtn.addEventListener('click', () => {
                let val = parseInt(qtyInput.value) || 1;
                qtyInput.value = val + 1;
                updateSerialNumbersAndTotal();
            });
            
            const priceInput = row.querySelector('.item-price');
            priceInput.addEventListener('input', updateSerialNumbersAndTotal);
        };

        const setupAutocompleteForItem = (row) => {
            const input = row.querySelector('.item-name');
            const dropdown = row.querySelector('.autocomplete-dropdown');
            if (!input || !dropdown) return;

            const items = [
                "Front door",
                "Back door",
                "Top front door",
                "Front window",
                "Back window",
                "Kitchen window",
                "Hall window",
                "Window 3 paali",
                "Window 2 paali",
                "Kitchen window 2 paali",
                "Hall window 2 paali",
                "Ventilation",
                "Main door frame (9x3 inch)",
                "Door frame (with bottom frame)",
                "Door frame",
                "Front bottom window"
            ];

            let highlightedIndex = -1;

            const renderDropdown = (filterText = '') => {
                const query = filterText.toLowerCase().trim();
                const filtered = items.filter(item => item.toLowerCase().includes(query));
                
                dropdown.innerHTML = '';
                
                if (filtered.length === 0) {
                    dropdown.style.display = 'none';
                    dropdown.classList.remove('active');
                    return;
                }

                filtered.forEach((item) => {
                    const div = document.createElement('div');
                    div.className = 'autocomplete-item';
                    div.textContent = item;
                    
                    if (item.toLowerCase() === input.value.toLowerCase().trim()) {
                        div.classList.add('selected');
                    }
                    
                    div.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        selectItem(item);
                    });
                    
                    dropdown.appendChild(div);
                });

                dropdown.style.display = 'flex';
                requestAnimationFrame(() => {
                    dropdown.classList.add('active');
                });
                
                highlightedIndex = -1;
            };

            const selectItem = (value) => {
                input.value = value;
                closeDropdown();
                input.dispatchEvent(new Event('input', { bubbles: true }));
            };

            const closeDropdown = () => {
                dropdown.classList.remove('active');
                setTimeout(() => {
                    if (!dropdown.classList.contains('active')) {
                        dropdown.style.display = 'none';
                    }
                }, 200);
                highlightedIndex = -1;
            };

            const openDropdown = () => {
                renderDropdown(input.value);
            };

            input.addEventListener('focus', openDropdown);
            input.addEventListener('click', openDropdown);
            input.addEventListener('blur', closeDropdown);
            input.addEventListener('input', () => {
                renderDropdown(input.value);
            });

            input.addEventListener('keydown', (e) => {
                const activeItems = dropdown.querySelectorAll('.autocomplete-item');
                if (!dropdown.classList.contains('active') || activeItems.length === 0) {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        openDropdown();
                        e.preventDefault();
                    }
                    return;
                }

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    highlightedIndex = (highlightedIndex + 1) % activeItems.length;
                    updateHighlight(activeItems);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    highlightedIndex = (highlightedIndex - 1 + activeItems.length) % activeItems.length;
                    updateHighlight(activeItems);
                } else if (e.key === 'Enter') {
                    if (highlightedIndex >= 0 && highlightedIndex < activeItems.length) {
                        e.preventDefault();
                        selectItem(activeItems[highlightedIndex].textContent);
                    }
                } else if (e.key === 'Escape') {
                    closeDropdown();
                }
            });

            const updateHighlight = (itemsList) => {
                itemsList.forEach((item, idx) => {
                    if (idx === highlightedIndex) {
                        item.classList.add('highlighted');
                        item.scrollIntoView({ block: 'nearest' });
                    } else {
                        item.classList.remove('highlighted');
                    }
                });
            };
        };

        const addRow = (itemName = '', qty = 1, size = '', price = '') => {
            const index = productRowsContainer.children.length;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = createRowHtml(index, itemName, qty, size, price);
            const rowElement = tempDiv.firstElementChild;
            productRowsContainer.appendChild(rowElement);
            bindRowEvents(rowElement);
            setupAutocompleteForItem(rowElement);
            updateSerialNumbersAndTotal();
        };

        // Add initial default product row
        addRow();

        addProductRowBtn.addEventListener('click', () => {
            addRow();
            // Scroll down to the new row
            const rows = productRowsContainer.getElementsByClassName('product-row');
            if (rows.length > 0) {
                rows[rows.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        
        // Handle Submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const client = document.getElementById('proj-client').value.trim();
            const phone = document.getElementById('proj-phone').value.trim();
            const siteAddress = document.getElementById('proj-address').value.trim();
            const startDate = document.getElementById('proj-date').value;
            const expectedCompletionDate = document.getElementById('proj-completion-date').value;
            
            const statusElement = document.querySelector('input[name="status"]:checked');
            const status = statusElement ? statusElement.value : 'Running';
            
            // Validation
            const errors = [];
            if (!client) {
                errors.push('Please enter the Client Name.');
            }

            const rows = productRowsContainer.getElementsByClassName('product-row');
            if (rows.length === 0) {
                errors.push('Please add at least one product/item.');
            }

            const productsData = [];
            Array.from(rows).forEach((row, idx) => {
                const itemName = row.querySelector('.item-name').value.trim();
                const qty = parseInt(row.querySelector('.item-qty').value) || 1;
                const size = row.querySelector('.item-size').value.trim();
                const priceVal = row.querySelector('.item-price').value;
                const price = parseFloat(priceVal);

                if (!itemName) {
                    errors.push(`Item #${idx + 1}: Please enter an Item Name.`);
                }
                if (priceVal === '' || isNaN(price) || price < 0) {
                    errors.push(`Item #${idx + 1}: Please enter a valid Price (0 or more).`);
                }

                productsData.push({
                    no: idx + 1,
                    itemName,
                    quantity: qty,
                    size,
                    price: price || 0
                });
            });
            
            if (errors.length > 0) {
                errorBox.innerHTML = errors.map(err => `<div>• ${err}</div>`).join('');
                errorBox.style.display = 'block';
                window.scrollTo(0, 0); // Scroll to top to see error box
                return;
            }
            
            errorBox.style.display = 'none';
            
            // Add Project through State manager
            addProject({
                client,
                phone,
                siteAddress,
                startDate,
                expectedCompletionDate,
                products: productsData,
                status
            });
            
            // Redirect to home dashboard
            navigate('/');
        });
    }
};
