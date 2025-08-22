/**
 * Better Interface - Configuration des boutons d'actions personnalisées
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
 *     buttonClass: 'ngBetterInterface-delete-all-button',
 *     title: 'Delete All',
 *     icon: '<span class="material-icons">delete_sweep</span>',
 *     group: null,
 *     backgroundColor: '#dc2626',
 *     hoverBackgroundColor: '#b91c1c',
 *     alwaysVisible: true  // Ce bouton reste actif même sans sélection
 * }
 */

var ngBetterInterfaceCustomActions = {
	'trash': {
		buttonClass: 'ngBetterInterface-trash-button',
		title: 'Move to trash',
		icon: '<span class="material-icons">delete</span>',
		group: null,
		backgroundColor: '#dc3545',
		hoverBackgroundColor: '#c82333'
	},
	'untrash': {
		buttonClass: 'ngBetterInterface-untrash-button',
		title: 'Restore from trash',
		icon: '<span class="material-icons">restore_page</span>',
		group: null,
		backgroundColor: '#28a745',
		hoverBackgroundColor: '#218838'
	},
	'delete': {
		buttonClass: 'ngBetterInterface-trash-button',
		title: 'Delete permanently',
		icon: '<span class="material-icons">delete_forever</span>',
		group: null,
		backgroundColor: '#dc3545',
		hoverBackgroundColor: '#c82333'
	},
	'edit': {
		buttonClass: 'ngBetterInterface-edit-button',
		title: 'Edit selected',
		icon: '<span class="material-icons">edit</span>',
		group: null,
		backgroundColor: '#17a2b8',
		hoverBackgroundColor: '#138496'
	},
	'update-selected': {
		buttonClass: 'ngBetterInterface-update-button',
		title: 'Update selected',
		icon: '<span class="material-icons">upgrade</span>',
		group: null,
		backgroundColor: '#ffc107',
		hoverBackgroundColor: '#e0a800'
	},
	'delete-selected': {
		buttonClass: 'ngBetterInterface-trash-button',
		title: 'Delete selected',
		icon: '<span class="material-icons">delete</span>',
		group: null,
		backgroundColor: '#dc3545',
		hoverBackgroundColor: '#c82333'
	},
	'approve': {
		buttonClass: 'ngBetterInterface-approve-button',
		title: 'Approve',
		icon: '<span class="material-icons">thumb_up</span>',
		group: 'approval',
		backgroundColor: '#28a745',
		hoverBackgroundColor: '#218838'
	},
	'unapprove': {
		buttonClass: 'ngBetterInterface-unapprove-button',
		title: 'Unapprove',
		icon: '<span class="material-icons">thumb_down</span>',
		group: 'approval',
		backgroundColor: '#6c757d',
		hoverBackgroundColor: '#5a6268'
	},
	'spam': {
		buttonClass: 'ngBetterInterface-spam-button',
		title: 'Mark as spam',
		icon: '<span class="material-icons">dangerous</span>',
		group: null,
		backgroundColor: '#fd7e14',
		hoverBackgroundColor: '#e8690b'
	},
	'unspam': {
		buttonClass: 'ngBetterInterface-unspam-button',
		title: 'Remove from spam',
		icon: '<span class="material-icons">check_circle</span>',
		group: null,
		backgroundColor: '#6f42c1',
		hoverBackgroundColor: '#5a32a3'
	},
	'resetpassword': {
		buttonClass: 'ngBetterInterface-reset-password-button',
		title: 'Reset password',
		icon: '<span class="material-icons">mail_lock</span>',
		group: null,
		backgroundColor: '#20c997',
		hoverBackgroundColor: '#1ea085'
	},	
	'activate-selected': {
		buttonClass: 'ngBetterInterface-activate-button',
		title: 'Activate selected',
		icon: '<span class="material-icons">power</span>',
		group: 'activation',
		backgroundColor: '#22c55e',
		hoverBackgroundColor: '#16a34a'
	},
	'deactivate-selected': {
		buttonClass: 'ngBetterInterface-deactivate-button',
		title: 'Deactivate selected',
		icon: '<span class="material-icons">power_off</span>',
		group: 'activation',
		backgroundColor: '#ef4444',
		hoverBackgroundColor: '#c82333'
	},
	'enable-auto-update-selected': {
		buttonClass: 'ngBetterInterface-enable-auto-update-button',
		title: 'Enable auto updates',
		icon: '<span class="dashicons dashicons-update"></span><span class="dashicons dashicons-yes-alt ngBetterInterface-secondary-icon"></span>',
		group: 'auto-update',
		backgroundColor: '#20c997',
		hoverBackgroundColor: '#1ea085'
	},
	'disable-auto-update-selected': {
		buttonClass: 'ngBetterInterface-disable-auto-update-button',
		title: 'Disable auto updates',
		icon: '<span class="dashicons dashicons-update"></span><span class="dashicons dashicons-no-alt ngBetterInterface-secondary-icon"></span>',
		group: 'auto-update',
		backgroundColor: '#6c757d',
		hoverBackgroundColor: '#5a6268'
	}
};
