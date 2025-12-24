/**
 * WP Admin UI - Configuration des boutons d'actions personnalisées
 * Définition des actions disponibles pour la barre flottante
 * 
 * Propriétés disponibles :
 * - buttonClass: classe CSS du bouton
 * - title: titre affiché au hover
 * - icon: icône du bouton (Material Icons recommandé)
 * - group: groupe pour les boutons liés (null = pas de groupe)
 * - backgroundColor: couleur de fond du bouton
 * - hoverBackgroundColor: couleur de fond au hover
 * - alwaysVisible: true si le bouton doit rester actif même sans sélection (ex: delete_all)
 * 
 * Exemple d'action toujours visible :
 * 'trash': {
 *     buttonClass: 'ngWPAdminUI-delete-all-button',
 *     title: 'Delete All',
 *     icon: '<span class="material-icons">delete_sweep</span>',
 *     group: null,
 *     backgroundColor: '#dc2626',
 *     hoverBackgroundColor: '#b91c1c',
 *     alwaysVisible: true  // Ce bouton reste actif même sans sélection
 * }
 */

// Pourquoi: utiliser le préfixe ngWPAdminUI pour la cohérence avec le reste du plugin
var ngWPAdminUI_CustomActions = {
	'trash': {
		buttonClass: 'ngWPAdminUI-trash-button',
		title: 'Move to trash',
		icon: '<span class="material-icons">delete</span>',
		group: null,
		backgroundColor: '#6b7280',
		hoverBackgroundColor: '#4b5563'
	},
	'untrash': {
		buttonClass: 'ngWPAdminUI-untrash-button',
		title: 'Restore from trash',
		icon: '<span class="material-icons">restore_page</span>',
		group: null,
		backgroundColor: '#4b5563',
		hoverBackgroundColor: '#374151'
	},
	'delete': {
		buttonClass: 'ngWPAdminUI-trash-button',
		title: 'Delete permanently',
		icon: '<span class="material-icons">delete_forever</span>',
		group: null,
		backgroundColor: '#6b7280',
		hoverBackgroundColor: '#4b5563'
	},
	'edit': {
		buttonClass: 'ngWPAdminUI-edit-button',
		title: 'Edit selected',
		icon: '<span class="material-icons">edit</span>',
		group: null,
		backgroundColor: '#4b5563',
		hoverBackgroundColor: '#374151'
	},
	'update-selected': {
		buttonClass: 'ngWPAdminUI-update-button',
		title: 'Update selected',
		icon: '<span class="material-icons">upgrade</span>',
		group: null,
		backgroundColor: '#4b5563',
		hoverBackgroundColor: '#374151'
	},
	'delete-selected': {
		buttonClass: 'ngWPAdminUI-trash-button',
		title: 'Delete selected',
		icon: '<span class="material-icons">delete</span>',
		group: null,
		backgroundColor: '#dc3545',
		hoverBackgroundColor: '#c82333'
	},
	'approve': {
		buttonClass: 'ngWPAdminUI-approve-button',
		title: 'Approve',
		icon: '<span class="material-icons">thumb_up</span>',
		group: 'approval',
		backgroundColor: '#4b5563',
		hoverBackgroundColor: '#374151'
	},
	'unapprove': {
		buttonClass: 'ngWPAdminUI-unapprove-button',
		title: 'Unapprove',
		icon: '<span class="material-icons">thumb_down</span>',
		group: 'approval',
		backgroundColor: '#6b7280',
		hoverBackgroundColor: '#4b5563'
	},
	'spam': {
		buttonClass: 'ngWPAdminUI-spam-button',
		title: 'Mark as spam',
		icon: '<span class="material-icons">dangerous</span>',
		group: null,
		backgroundColor: '#6b7280',
		hoverBackgroundColor: '#4b5563'
	},
	'unspam': {
		buttonClass: 'ngWPAdminUI-unspam-button',
		title: 'Remove from spam',
		icon: '<span class="material-icons">check_circle</span>',
		group: null,
		backgroundColor: '#4b5563',
		hoverBackgroundColor: '#374151'
	},
	'resetpassword': {
		buttonClass: 'ngWPAdminUI-reset-password-button',
		title: 'Reset password',
		icon: '<span class="material-icons">mail_lock</span>',
		group: null,
		backgroundColor: '#4b5563',
		hoverBackgroundColor: '#374151'
	},	
	'activate-selected': {
		buttonClass: 'ngWPAdminUI-activate-button',
		title: 'Activate selected',
		icon: '<span class="material-icons">power</span>',
		group: 'activation',
		backgroundColor: '#4b5563',
		hoverBackgroundColor: '#374151'
	},
	'deactivate-selected': {
		buttonClass: 'ngWPAdminUI-deactivate-button',
		title: 'Deactivate selected',
		icon: '<span class="material-icons">power_off</span>',
		group: 'activation',
		backgroundColor: '#6b7280',
		hoverBackgroundColor: '#4b5563'
	},
	'enable-auto-update-selected': {
		buttonClass: 'ngWPAdminUI-enable-auto-update-button',
		title: 'Enable auto updates',
		icon: '<span class="dashicons dashicons-update"></span><span class="dashicons dashicons-yes-alt ngWPAdminUI-secondary-icon"></span>',
		group: 'auto-update',
		backgroundColor: '#4b5563',
		hoverBackgroundColor: '#374151'
	},
	'disable-auto-update-selected': {
		buttonClass: 'ngWPAdminUI-disable-auto-update-button',
		title: 'Disable auto updates',
		icon: '<span class="dashicons dashicons-update"></span><span class="dashicons dashicons-no-alt ngWPAdminUI-secondary-icon"></span>',
		group: 'auto-update',
		backgroundColor: '#6b7280',
		hoverBackgroundColor: '#4b5563'
	}
};

// Exposer la variable globalement pour qu'elle soit accessible
// Pourquoi: permettre à ActionButtons.js d'accéder à la configuration
window.ngWPAdminUI_CustomActions = ngWPAdminUI_CustomActions;
// Alias pour compatibilité avec l'ancien nom
window.ngBetterInterfaceCustomActions = ngWPAdminUI_CustomActions;
