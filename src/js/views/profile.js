import { getBusinessProfile, updateBusinessProfile } from '../state.js';

export const ProfileView = {
    render: () => {
        const profile = getBusinessProfile();

        return `
            <header class="app-header" style="background-color: var(--bg-card); padding: 20px 24px; border-bottom: 2px solid var(--border-color);">
                <div class="app-title-container">
                    <span class="app-logo" style="font-size: 32px;">👤</span>
                    <span class="app-title">Profile</span>
                </div>
            </header>
            
            <main class="container" style="padding-top: 24px; padding-bottom: 40px;">
                <!-- Main Business Profile Header Banner -->
                <div style="background-color: var(--color-primary-light); border: 2px solid var(--color-primary); border-radius: var(--border-radius); padding: 24px 20px; margin-bottom: 28px; text-align: center; box-shadow: var(--shadow-soft);">
                    <div style="font-size: 54px; margin-bottom: 8px;">🪵</div>
                    <h1 style="font-size: 28px; font-weight: 800; color: var(--color-primary); margin-bottom: 6px; word-break: break-word;">${escapeHtml(profile.companyName)}</h1>
                    <p style="font-size: 18px; font-weight: 600; color: var(--text-secondary); margin: 0;">${escapeHtml(profile.tagline)}</p>
                </div>

                <!-- Section Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin: 0;">Business Details</h2>
                </div>

                <!-- Business Details Cards (Large typography & spacing for high readability) -->
                <div style="display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px;">
                    
                    <!-- Company Name Card -->
                    <div class="profile-card" style="background-color: var(--bg-card); border: 2px solid var(--border-color); border-radius: var(--border-radius); padding: 22px 24px; box-shadow: var(--shadow-soft);">
                        <div style="font-size: 15px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">🏢</span> Company Name
                        </div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--text-primary); line-height: 1.3; word-break: break-word;">
                            ${escapeHtml(profile.companyName)}
                        </div>
                    </div>

                    <!-- Tagline Card -->
                    <div class="profile-card" style="background-color: var(--bg-card); border: 2px solid var(--border-color); border-radius: var(--border-radius); padding: 22px 24px; box-shadow: var(--shadow-soft);">
                        <div style="font-size: 15px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">🏷️</span> Tagline
                        </div>
                        <div style="font-size: 22px; font-weight: 600; color: var(--text-primary); line-height: 1.3; word-break: break-word;">
                            ${escapeHtml(profile.tagline)}
                        </div>
                    </div>

                    <!-- Phone Number Card -->
                    <div class="profile-card" style="background-color: var(--bg-card); border: 2px solid var(--border-color); border-radius: var(--border-radius); padding: 22px 24px; box-shadow: var(--shadow-soft);">
                        <div style="font-size: 15px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">📞</span> Phone Number
                        </div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--text-primary); line-height: 1.3;">
                            <a href="tel:${escapeHtml(profile.phone)}" style="color: var(--color-primary); text-decoration: none;">
                                ${escapeHtml(profile.phone)}
                            </a>
                        </div>
                    </div>

                    <!-- Email Address Card -->
                    <div class="profile-card" style="background-color: var(--bg-card); border: 2px solid var(--border-color); border-radius: var(--border-radius); padding: 22px 24px; box-shadow: var(--shadow-soft);">
                        <div style="font-size: 15px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">✉️</span> Email Address
                        </div>
                        <div style="font-size: 22px; font-weight: 700; color: var(--text-primary); line-height: 1.3; word-break: break-all;">
                            <a href="mailto:${escapeHtml(profile.email)}" style="color: var(--color-primary); text-decoration: none;">
                                ${escapeHtml(profile.email)}
                            </a>
                        </div>
                    </div>

                    <!-- Workshop Address Card -->
                    <div class="profile-card" style="background-color: var(--bg-card); border: 2px solid var(--border-color); border-radius: var(--border-radius); padding: 22px 24px; box-shadow: var(--shadow-soft);">
                        <div style="font-size: 15px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">📍</span> Workshop Address
                        </div>
                        <div style="font-size: 22px; font-weight: 600; color: var(--text-primary); line-height: 1.4; word-break: break-word;">
                            ${escapeHtml(profile.address)}
                        </div>
                    </div>

                </div>

                <!-- Edit Business Details Button -->
                <div style="margin-bottom: 36px;">
                    <button id="btn-edit-profile" class="btn btn-primary" style="height: 68px; font-size: 22px; font-weight: 700; border-radius: var(--border-radius); box-shadow: 0 4px 16px rgba(211, 84, 0, 0.3);">
                        ✏️ Edit Business Details
                    </button>
                </div>

                <!-- App Information Section -->
                <div style="display: flex; flex-direction: column; gap: 18px;">
                    <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin: 0;">App Information</h2>
                    
                    <!-- About App Card -->
                    <div style="background-color: var(--bg-card); border: 2px solid var(--border-color); border-radius: var(--border-radius); padding: 22px 24px; box-shadow: var(--shadow-soft);">
                        <div style="font-size: 15px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">ℹ️</span> About App
                        </div>
                        <p style="font-size: 18px; color: var(--text-primary); line-height: 1.5; margin: 0;">
                            Simple and efficient project tracking, quotation generation, payment management, and expense recording crafted specifically for woodworking and carpentry businesses.
                        </p>
                    </div>

                    <!-- App Version Card -->
                    <div style="background-color: var(--bg-card); border: 2px solid var(--border-color); border-radius: var(--border-radius); padding: 22px 24px; box-shadow: var(--shadow-soft); display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 15px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">📱</span> App Version
                        </div>
                        <div style="font-size: 20px; font-weight: 800; color: var(--color-primary); background-color: var(--color-primary-light); padding: 6px 16px; border-radius: 20px; border: 1.5px solid var(--color-primary);">
                            v1.1.0
                        </div>
                    </div>
                </div>

            </main>

            <!-- Edit Business Details Modal -->
            <div id="modal-edit-profile" class="sheet-backdrop" style="display: none; align-items: center; justify-content: center; z-index: 1000; padding: 16px;">
                <div style="background-color: var(--bg-card); border-radius: var(--border-radius); width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto; padding: 28px 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 2px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid var(--border-color);">
                        <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin: 0;">Edit Business Details</h2>
                        <button id="btn-close-modal" type="button" style="background: none; border: none; font-size: 28px; cursor: pointer; color: var(--text-secondary); line-height: 1; padding: 4px 8px;">✕</button>
                    </div>

                    <form id="form-edit-profile" style="display: flex; flex-direction: column; gap: 20px;">
                        <div>
                            <label for="input-company-name" style="display: block; font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Company Name</label>
                            <input type="text" id="input-company-name" value="${escapeHtml(profile.companyName)}" required style="width: 100%; height: 56px; padding: 12px 16px; font-size: 18px; border: 2px solid var(--border-color); border-radius: 12px; font-family: var(--font-base);" />
                        </div>

                        <div>
                            <label for="input-tagline" style="display: block; font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Tagline</label>
                            <input type="text" id="input-tagline" value="${escapeHtml(profile.tagline)}" style="width: 100%; height: 56px; padding: 12px 16px; font-size: 18px; border: 2px solid var(--border-color); border-radius: 12px; font-family: var(--font-base);" />
                        </div>

                        <div>
                            <label for="input-phone" style="display: block; font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Phone Number</label>
                            <input type="tel" id="input-phone" value="${escapeHtml(profile.phone)}" required style="width: 100%; height: 56px; padding: 12px 16px; font-size: 18px; border: 2px solid var(--border-color); border-radius: 12px; font-family: var(--font-base);" />
                        </div>

                        <div>
                            <label for="input-email" style="display: block; font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Email Address</label>
                            <input type="email" id="input-email" value="${escapeHtml(profile.email)}" required style="width: 100%; height: 56px; padding: 12px 16px; font-size: 18px; border: 2px solid var(--border-color); border-radius: 12px; font-family: var(--font-base);" />
                        </div>

                        <div>
                            <label for="input-address" style="display: block; font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Workshop Address</label>
                            <textarea id="input-address" rows="3" required style="width: 100%; padding: 12px 16px; font-size: 18px; border: 2px solid var(--border-color); border-radius: 12px; font-family: var(--font-base); resize: vertical;">${escapeHtml(profile.address)}</textarea>
                        </div>

                        <div style="display: flex; gap: 12px; margin-top: 12px;">
                            <button type="button" id="btn-cancel-modal" class="btn btn-secondary" style="height: 60px; font-size: 20px; font-weight: 600;">Cancel</button>
                            <button type="submit" id="btn-save-profile" class="btn btn-primary" style="height: 60px; font-size: 20px; font-weight: 700;">Save Details</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    init: () => {
        const editBtn = document.getElementById('btn-edit-profile');
        const modal = document.getElementById('modal-edit-profile');
        const closeBtn = document.getElementById('btn-close-modal');
        const cancelBtn = document.getElementById('btn-cancel-modal');
        const form = document.getElementById('form-edit-profile');

        const openModal = () => {
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('active');
                document.body.classList.add('scroll-locked');
            }
        };

        const closeModal = () => {
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
                document.body.classList.remove('scroll-locked');
            }
        };

        if (editBtn) {
            editBtn.addEventListener('click', openModal);
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const companyName = document.getElementById('input-company-name').value;
                const tagline = document.getElementById('input-tagline').value;
                const phone = document.getElementById('input-phone').value;
                const email = document.getElementById('input-email').value;
                const address = document.getElementById('input-address').value;

                updateBusinessProfile({
                    companyName,
                    tagline,
                    phone,
                    email,
                    address
                });

                closeModal();
                // Trigger route reload / re-render
                window.location.hash = '#/profile?updated=' + Date.now();
            });
        }
    }
};

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
