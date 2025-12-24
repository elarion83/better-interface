/**
 * ActionButtons: Gère les boutons d'actions personnalisés (delete_all, actions en lot)
 * Extrait de createFloatingActionBar pour améliorer la lisibilité
 */
(function($) {
	window.ActionButtons = {
		/**
		 * Crée et configure tous les boutons d'actions personnalisés
		 * @param {jQuery} $nav - Élément jQuery de la navigation
		 * @param {jQuery} $actionsContainer - Conteneur pour les boutons d'actions
		 * @returns {Object} - Objet contenant $deleteAllButtonCustom et les gestionnaires d'événements
		 */
		create: function($nav, $actionsContainer) {
			// Utiliser la configuration des actions personnalisées depuis la config centralisée
			// Pourquoi: utiliser la configuration centralisée pour accéder aux actions personnalisées
			var customActions = window.WPAdminUI && window.WPAdminUI.Config ? window.WPAdminUI.Config.getCustomActions() : {};
			
			// Ajouter le bouton delete_all s'il existe
			var $deleteAllButton = $nav.find('#delete_all');
			if ($deleteAllButton.length > 0) {
				customActions['delete_all'] = {
					buttonClass: 'ngWPAdminUI-delete-all-button',
					title: 'Delete All',
					icon: '<span class="material-icons">cleaning_services</span>',
					backgroundColor: '#dc2996',
					hoverBackgroundColor: '#b91c1c',
					alwaysVisible: true
				};
			}
			
			// Traiter les actions du select et le bouton delete_all
			var $actionSelect = $nav.find('#bulk-action-selector-top');
			var customButtons = [];
			var groupedButtons = {};
			
			// Traiter le bouton delete_all s'il existe
			var $deleteAllButtonCustom = null;
			if ($deleteAllButton.length > 0) {
				var action = customActions['delete_all'];
				var $button = $('<button type="button" class="' + action.buttonClass + '" title="' + action.title + '" data-action="delete_all" data-always-visible="true">' + action.icon + '</button>');
				
				// Stocker l'icône originale dans les données du bouton
				$button.data('original-icon', action.icon);
				
				// Appliquer les couleurs personnalisées
				if (action.backgroundColor) {
					$button.css('background', action.backgroundColor);
				}
				if (action.hoverBackgroundColor) {
					$button.data('hover-color', action.hoverBackgroundColor);
				}
				
				// Configurer l'action du bouton
				$button.on('click', function(e){
					e.preventDefault();
					
					// Popup de confirmation pour l'action delete_all
					// Pourquoi: utiliser la variable localisée correcte ngWPAdminUI_ajax
					var confirmText = (window.ngWPAdminUI_ajax && ngWPAdminUI_ajax.i18n && ngWPAdminUI_ajax.i18n.confirm_delete_all) || 'Are you sure you want to delete all items? This action cannot be undone.';
					
					if (confirm(confirmText)) {
						// Déclencher le clic sur le bouton original
						$deleteAllButton.trigger('click');
					}
				});
				
				$deleteAllButtonCustom = $button;
				
				// Masquer le bouton original
				$deleteAllButton.hide();
			}
			
			if ($actionSelect.length > 0) {
				// Énumérer les options du select
				$actionSelect.find('option').each(function(){
					var $option = $(this);
					var value = $option.val();
					
					// Ignorer l'option par défaut
					if (value === '-1') return;
					
					// Vérifier si c'est une action personnalisée
					if (customActions[value]) {
						var action = customActions[value];
						var buttonAttributes = 'class="' + action.buttonClass + '" title="' + action.title + '" data-action="' + value + '"';
						
						// Ajouter l'attribut data-always-visible si l'action est toujours visible
						if (action.alwaysVisible) {
							buttonAttributes += ' data-always-visible="true"';
						}
						
						var $button = $('<button type="button" ' + buttonAttributes + '>' + action.icon + '</button>');
						
						// Stocker l'icône originale dans les données du bouton
						$button.data('original-icon', action.icon);
						
						// Appliquer les couleurs personnalisées si définies
						if (action.backgroundColor) {
							$button.css('background', action.backgroundColor);
						}
						if (action.hoverBackgroundColor) {
							$button.data('hover-color', action.hoverBackgroundColor);
						}
						
						// Configurer l'action du bouton
						$button.on('click', function(e){
							e.preventDefault();
							
							// Vérifier qu'il y a des éléments sélectionnés
							var selectedCount = $('.wp-list-table tbody input[type="checkbox"]:checked').length;
							if (selectedCount === 0) {
								// Pourquoi: utiliser la variable localisée correcte ngWPAdminUI_ajax
								var pleaseSelectText = (window.ngWPAdminUI_ajax && ngWPAdminUI_ajax.i18n && ngWPAdminUI_ajax.i18n.please_select_items) || 'Please select at least one item to perform this action on.';
								alert(pleaseSelectText);
								return;
							}
							
							// Remplacer l'icône par une icône de chargement WordPress
							var loadingIcon = '<span class="dashicons dashicons-update ngWPAdminUI-loading-spinner"></span>';
							
							$(this).html(loadingIcon);
							
							// Désactiver le bouton pendant le chargement
							$(this).prop('disabled', true).addClass('loading');
							
							// S'assurer que le select est visible et fonctionnel
							$actionSelect.show();
							
							// Définir la valeur et déclencher l'action
							$actionSelect.val(value);
							
							// Déclencher le changement immédiatement
							$actionSelect.trigger('change');
							
							// Déclencher automatiquement le bouton Apply
							var $applyButton = $nav.find('input[type="submit"][value="Apply"]');
							if ($applyButton.length > 0) {
								$applyButton.show().trigger('click');
							}
						});
						
						// Grouper les boutons selon leur configuration
						if (action.group) {
							if (!groupedButtons[action.group]) {
								groupedButtons[action.group] = [];
							}
							groupedButtons[action.group].push($button);
						} else {
							customButtons.push($button);
						}
						
						// Masquer l'option au lieu de la supprimer
						$option.hide();
					}
				});
				
				// Ajouter d'abord les boutons groupés
				Object.keys(groupedButtons).forEach(function(groupName) {
					var buttons = groupedButtons[groupName];
					if (buttons.length > 0) {
						var $group = $('<div class="ngWPAdminUI-button-group ngWPAdminUI-' + groupName + '-group"></div>');
						buttons.forEach(function($button, index){
							// Ajouter les classes utilitaires pour les border-radius
							if (index === 0) {
								$button.addClass('no-br-right');
							} else if (index === buttons.length - 1) {
								$button.addClass('no-br-left');
							} else {
								$button.addClass('no-br-left no-br-right');
							}
							$group.append($button);
						});
						$actionsContainer.append($group);
					}
				});
				
				// Puis les boutons individuels
				customButtons.forEach(function($button){
					$actionsContainer.append($button);
				});
				
				// Appliquer les événements hover pour les couleurs personnalisées
				$('.ngWPAdminUI-floating-action-bar button[data-hover-color]').each(function(){
					var $button = $(this);
					var hoverColor = $button.data('hover-color');
					var originalColor = $button.css('background');
					
					$button.on('mouseenter', function(){
						$(this).css('background', hoverColor);
					}).on('mouseleave', function(){
						$(this).css('background', originalColor);
					});
				});
				
				// Vérifier s'il ne reste qu'une seule option non convertie en bouton
				var nonConvertedOptions = 0;
				$actionSelect.find('option').each(function(){
					var $option = $(this);
					var value = $option.val();
					// Compter seulement les options qui ne sont pas converties en boutons personnalisés
					if (value !== '-1' && !customActions[value]) {
						nonConvertedOptions++;
					}
				});
				
				// Si toutes les options sont soit converties en boutons soit l'option par défaut, masquer le select
				if (nonConvertedOptions === 0) {
					// Masquer le select et le bouton Apply
					$actionSelect.css({
						'opacity': '0',
						'width': '0',
						'overflow': 'hidden'
					});
					$actionSelect.next('input[type="submit"]').css({
						'opacity': '0',
						'width': '0',
						'overflow': 'hidden'
					});
				}
			}
			
			// Configurer les gestionnaires d'événements AJAX
			this.setupAjaxHandlers($nav);
			
			return {
				$deleteAllButtonCustom: $deleteAllButtonCustom
			};
		},
		
		/**
		 * Configure les gestionnaires d'événements AJAX pour les boutons
		 * @param {jQuery} $nav - Élément jQuery de la navigation
		 */
		setupAjaxHandlers: function($nav) {
			// Intercepter les soumissions de formulaires pour détecter les actions AJAX
			$(document).on('submit', 'form', function(e){
				var $form = $(this);
				var $submitButton = $form.find('input[type="submit"][value="Apply"]');
				
				// Vérifier si c'est un formulaire d'action en lot
				if ($submitButton.length > 0 && $form.find('select[name="action"], select[name="action2"]').length > 0) {
					// Trouver le bouton personnalisé correspondant
					var actionValue = $form.find('select[name="action"]').val() || $form.find('select[name="action2"]').val();
					var $customButton = $('.ngWPAdminUI-floating-action-bar button[data-action="' + actionValue + '"]');
					
					if ($customButton.length > 0) {
						// Marquer le bouton comme en cours de traitement
						$customButton.addClass('processing');
						
						// Stocker l'URL de la requête pour la détection
						$customButton.data('request-url', $form.attr('action') || window.location.href);
					}
				}
			});
			
			// Écouter les événements de fin de requête AJAX
			$(document).ajaxComplete(function(event, xhr, settings){
				// Vérifier si c'est une requête d'action en lot WordPress
				if (settings.url && (settings.url.includes('admin-ajax.php') || settings.url.includes('edit.php') || settings.url.includes('post.php'))) {
					// Restaurer tous les boutons en cours de traitement
					$('.ngWPAdminUI-floating-action-bar button.loading').each(function(){
						var $button = $(this);
						var $originalIcon = $button.data('original-icon');
						
						if ($originalIcon) {
							$button.html($originalIcon);
						}
						
						$button.prop('disabled', false).removeClass('loading processing');
					});
				}
			});
			
			// Écouter aussi les redirections et rechargements de page
			$(window).on('beforeunload', function(){
				// Restaurer tous les boutons avant le rechargement
				$('.ngWPAdminUI-floating-action-bar button.loading').each(function(){
					var $button = $(this);
					var $originalIcon = $button.data('original-icon');
					
					if ($originalIcon) {
						$button.html($originalIcon);
					}
					
					$button.prop('disabled', false).removeClass('loading processing');
				});
			});
			
			// Écouter aussi les erreurs AJAX pour restaurer les boutons
			$(document).ajaxError(function(event, xhr, settings, error){
				// Restaurer tous les boutons en cours de traitement en cas d'erreur
				$('.ngWPAdminUI-floating-action-bar button.loading').each(function(){
					var $button = $(this);
					var $originalIcon = $button.data('original-icon');
					
					if ($originalIcon) {
						$button.html($originalIcon);
					}
					
					$button.prop('disabled', false).removeClass('loading processing');
				});
			});
			
			// Écouter les changements de DOM pour détecter les mises à jour de la page
			var observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					// Si des notices WordPress apparaissent, c'est probablement la fin d'une action
					if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
						for (var i = 0; i < mutation.addedNodes.length; i++) {
							var node = mutation.addedNodes[i];
							if (node.nodeType === 1 && node.classList && node.classList.contains('notice')) {
								// Une notice WordPress est apparue, restaurer les boutons
								$('.ngWPAdminUI-floating-action-bar button.loading').each(function(){
									var $button = $(this);
									var $originalIcon = $button.data('original-icon');
									
									if ($originalIcon) {
										$button.html($originalIcon);
									}
									
									$button.prop('disabled', false).removeClass('loading processing');
								});
								break;
							}
						}
					}
				});
			});
			
			// Observer les changements dans le body
			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
		}
	};
})(jQuery);

