(function($){
	// BetterInterfaceAdmin: gère les interactions de la page d’admin
	function BetterInterfaceAdmin(){
		this.currentMode = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.current_mode) || 'default';
		this.availableModes = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.available_modes) || {};
		this.currentColorTheme = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.current_color_theme) || 'ocean';
		this.availableColorThemes = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.available_color_themes) || {};
		this.ajaxUrl = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.ajax_url) || ajaxurl;
		this.nonce = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.nonce) || '';

		this.selectedMode = null;
		this.selectedTheme = null;
	}

	BetterInterfaceAdmin.prototype.init = function(){
		this.initAccordionTables();
		this.bindRowBackgroundSelect();
		this.bindRowCheckboxSync();
		this.initializeSelectedRowsState();
		this.initPageTransition();
		this.initNoticesPositioning();
	};



	// ===== Barre d'actions flottante =====
	BetterInterfaceAdmin.prototype.initAccordionTables = function(){
		var self = this;
		$('.tablenav.top').each(function(){
			var $nav = $(this);
			if ($nav.data('biAccordionInit')) return;
			$nav.data('biAccordionInit', true);

			// Créer une barre flottante sur tous les supports
			self.createFloatingActionBar($nav);
			
			// Gérer le redimensionnement de la fenêtre pour adapter la largeur
			$(window).on('resize', function(){
				var $floatingBar = $('.ngBetterInterface-floating-action-bar');
				if ($floatingBar.length > 0) {
					// Adapter la largeur selon le format d'écran
					if (window.innerWidth < 768) {
						$floatingBar.addClass('ngBetterInterface-full-width');
					} else {
						$floatingBar.removeClass('ngBetterInterface-full-width');
					}
				}
			});
		});
	};

	BetterInterfaceAdmin.prototype.isInteractive = function($el){
		return $el.is('button, input, select, textarea, a, label, [contenteditable="true"]') || $el.closest('button, input, select, textarea, a, label, [contenteditable="true"]').length > 0;
	};



			// Créer une barre d'actions flottante en bas de l'écran
		BetterInterfaceAdmin.prototype.createFloatingActionBar = function($nav){
			var self = this;
			
			// Créer le container de la barre flottante
			var $floatingBar = $('<div class="ngBetterInterface-floating-action-bar slide-out"></div>');
			var $actionsContainer = $('<div class="ngBetterInterface-floating-actions"></div>');
			var $filtersContainer = $('<div class="ngBetterInterface-floating-filters"></div>');
		
		// Récupérer le nom des éléments depuis le titre de la page
		var itemName = 'items';
		var $pageTitle = $('h1.wp-heading-inline');
		if ($pageTitle.length > 0) {
			itemName = $pageTitle.text().trim().toLowerCase();
			// Nettoyer le nom (retirer les pluriels, articles, etc.)
			itemName = itemName.replace(/^all\s+/i, '').replace(/^manage\s+/i, '').replace(/^edit\s+/i, '');
			// Mettre au pluriel si nécessaire
			if (!itemName.endsWith('s')) {
				itemName += 's';
			}
		}
		
		// Créer le compteur d'éléments sélectionnés avec bouton de désélection
		var deselectAllText = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.i18n && ngBetterInterface_ajax.i18n.deselect_all) || 'Désélectionner tout';
		var $counter = $('<div class="ngBetterInterface-selection-counter"><div class="ngBetterInterface-counter-content"><span class="ngBetterInterface-counter-number">0</span><span class="ngBetterInterface-counter-text">' + itemName + '</span></div><button type="button" class="ngBetterInterface-deselect-all" title="' + deselectAllText + '"><span class="dashicons dashicons-no-alt"></span></button></div>');
		
		// Configurer le bouton de désélection
		$counter.find('.ngBetterInterface-deselect-all').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
			
			// Désélectionner toutes les cases à cocher
			$('.wp-list-table tbody input[type="checkbox"]:checked').prop('checked', false).trigger('change');
			
			// Désélectionner les cases "tout sélectionner"
			$('.wp-list-table thead input[type="checkbox"], .wp-list-table tfoot input[type="checkbox"]').prop('checked', false).trigger('change');
		});
		$actionsContainer.append($counter);
		
		// Configuration des actions personnalisées
		var customActions = {
			'trash': {
				buttonClass: 'ngBetterInterface-trash-button',
				title: 'Move to trash',
				icon: '<span class="dashicons dashicons-trash"></span>',
				group: null
			},
			'untrash': {
				buttonClass: 'ngBetterInterface-untrash-button',
				title: 'Restore from trash',
				icon: '<span class="dashicons dashicons-backup"></span>',
				group: null
			},
			'delete': {
				buttonClass: 'ngBetterInterface-trash-button',
				title: 'Delete permanently',
				icon: '<span class="dashicons dashicons-trash"></span>',
				group: null
			},
			'edit': {
				buttonClass: 'ngBetterInterface-edit-button',
				title: 'Edit selected',
				icon: '<span class="dashicons dashicons-edit"></span>',
				group: null
			},
			'update-selected': {
				buttonClass: 'ngBetterInterface-update-button',
				title: 'Update selected',
				icon: '<span class="dashicons dashicons-update"></span>',
				group: null
			},
			'delete-selected': {
				buttonClass: 'ngBetterInterface-trash-button',
				title: 'Delete selected',
				icon: '<span class="dashicons dashicons-trash"></span>',
				group: null
			},
			'approve': {
				buttonClass: 'ngBetterInterface-approve-button',
				title: 'Approve selected',
				icon: '<span class="dashicons dashicons-thumbs-up"></span>',
				group: 'approval'
			},
			'unapprove': {
				buttonClass: 'ngBetterInterface-unapprove-button',
				title: 'Unapprove selected',
				icon: '<span class="dashicons dashicons-thumbs-down"></span>',
				group: 'approval'
			},
			'spam': {
				buttonClass: 'ngBetterInterface-spam-button',
				title: 'Mark as spam',
				icon: '<span class="dashicons dashicons-flag"></span>',
				group: null
			},
			'unspam': {
				buttonClass: 'ngBetterInterface-unspam-button',
				title: 'Remove from spam',
				icon: '<span class="dashicons dashicons-undo"></span>',
				group: null
			},
			'resetpassword': {
				buttonClass: 'ngBetterInterface-reset-password-button',
				title: 'Reset password',
				icon: '<span class="dashicons dashicons-admin-network"></span>',
				group: null
			},	
			'activate-selected': {
				buttonClass: 'ngBetterInterface-activate-button',
				title: 'Activate selected',
				icon: '<span class="dashicons dashicons-yes-alt"></span>',
				group: 'activation'
			},
			'deactivate-selected': {
				buttonClass: 'ngBetterInterface-deactivate-button',
				title: 'Deactivate selected',
				icon: '<span class="dashicons dashicons-no-alt"></span>',
				group: 'activation'
			},
			'enable-auto-update-selected': {
				buttonClass: 'ngBetterInterface-enable-auto-update-button',
				title: 'Enable auto updates',
				icon: '<span class="dashicons dashicons-update"></span><span class="dashicons dashicons-yes-alt ngBetterInterface-secondary-icon"></span>',
				group: 'auto-update'
			},
			'disable-auto-update-selected': {
				buttonClass: 'ngBetterInterface-disable-auto-update-button',
				title: 'Disable auto updates',
				icon: '<span class="dashicons dashicons-update"></span><span class="dashicons dashicons-no-alt ngBetterInterface-secondary-icon"></span>',
				group: 'auto-update'
			}
		};
		
		// Traiter les actions du select
		var $actionSelect = $nav.find('#bulk-action-selector-top');
		var customButtons = [];
		var groupedButtons = {};
		
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
					var $button = $('<button type="button" class="' + action.buttonClass + '" title="' + action.title + '" data-action="' + value + '">' + action.icon + '</button>');
					
					// Stocker l'icône originale dans les données du bouton
					$button.data('original-icon', action.icon);
					
					// Configurer l'action du bouton
					$button.on('click', function(e){
						e.preventDefault();
						
						// Vérifier qu'il y a des éléments sélectionnés
						var selectedCount = $('.wp-list-table tbody input[type="checkbox"]:checked').length;
						if (selectedCount === 0) {
							var pleaseSelectText = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.i18n && ngBetterInterface_ajax.i18n.please_select_items) || 'Please select at least one item to perform this action on.';
							alert(pleaseSelectText);
							return;
						}
						
						// Remplacer l'icône par une icône de chargement WordPress
						var loadingIcon = '<span class="dashicons dashicons-update ngBetterInterface-loading-spinner"></span>';
						
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
					var $group = $('<div class="ngBetterInterface-button-group ngBetterInterface-' + groupName + '-group"></div>');
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
		
		// Intercepter les soumissions de formulaires pour détecter les actions AJAX
		$(document).on('submit', 'form', function(e){
			var $form = $(this);
			var $submitButton = $form.find('input[type="submit"][value="Apply"]');
			
			// Vérifier si c'est un formulaire d'action en lot
			if ($submitButton.length > 0 && $form.find('select[name="action"], select[name="action2"]').length > 0) {
				// Trouver le bouton personnalisé correspondant
				var actionValue = $form.find('select[name="action"]').val() || $form.find('select[name="action2"]').val();
				var $customButton = $('.ngBetterInterface-floating-action-bar button[data-action="' + actionValue + '"]');
				
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
				$('.ngBetterInterface-floating-action-bar button.loading').each(function(){
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
			$('.ngBetterInterface-floating-action-bar button.loading').each(function(){
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
			$('.ngBetterInterface-floating-action-bar button.loading').each(function(){
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
							$('.ngBetterInterface-floating-action-bar button.loading').each(function(){
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
		
		// Récupérer les filtres depuis le DOM original
		$nav.find('.actions > *').each(function(){
			var $original = $(this);
			
			// Ignorer les éléments d'action (select[name="action"], boutons Apply, etc.)
			if ($original.is('select[name="action"], select[name="action2"]') || 
				$original.is('input[type="submit"][value="Apply"]') ||
				$original.closest('.bulkactions').length > 0) {
			return;
		}

			// Ignorer les éléments déjà traités comme boutons personnalisés
			var isCustomAction = false;
			if ($original.is('select')) {
				var value = $original.val();
				if (customActions[value]) {
					isCustomAction = true;
				}
			}
			if (isCustomAction) return;
			
			var $clone = $original.clone();
			
			// Copier les attributs importants
			$clone.attr('id', $original.attr('id') + '-floating');
			$clone.attr('name', $original.attr('name'));
			$clone.attr('form', $original.attr('form'));
			$clone.attr('type', $original.attr('type'));
			$clone.attr('value', $original.attr('value'));
			
			// Pour les boutons, déclencher l'action sur l'original
			if ($clone.is('button, input[type="submit"]')) {
				$clone.on('click', function(e){
					e.preventDefault();
					$original.trigger('click');
				});
			}
			
			// Pour les selects, synchroniser avec l'original
			if ($clone.is('select')) {
				$clone.on('change', function(){
					$original.val($(this).val()).trigger('change');
				});
				$original.on('change', function(){
					$clone.val($(this).val());
				});
			}
			
			// Pour les inputs, synchroniser avec l'original
			if ($clone.is('input[type="text"], input[type="search"], input[type="date"], input[type="number"]')) {
				$clone.on('input', function(){
					$original.val($(this).val()).trigger('input');
				});
				$original.on('input', function(){
					$clone.val($(this).val());
				});
			}
			
			$filtersContainer.append($clone);
		});
		
		// Assembler la barre
		if ($actionsContainer.children().length > 0) {
			$floatingBar.append($actionsContainer);
		}
		if ($filtersContainer.children().length > 0) {
			$floatingBar.append($filtersContainer);
		}
		
		// Ajouter au body si on a du contenu
		if ($floatingBar.children().length > 0) {
			$('body').append($floatingBar);
			
			// Gérer l'état des actions selon la sélection
			self.updateFloatingBarState();
			
			// Écouter les changements de sélection
			$(document).on('change', '.wp-list-table input[type="checkbox"]', function(){
				self.updateFloatingBarState();
			});
			
			// Appliquer la classe de largeur selon le format d'écran
			if (window.innerWidth < 768) {
				$floatingBar.addClass('ngBetterInterface-full-width');
			}
			
			// Masquer la navigation originale seulement sur desktop
			if (window.innerWidth >= 768) {
				$nav.hide();
			}
		}
	};

	// Mettre à jour l'état de la barre flottante (activer/désactiver les actions)
	BetterInterfaceAdmin.prototype.updateFloatingBarState = function(){
		var selectedCount = $('.wp-list-table tbody input[type="checkbox"]:checked').length;
		var hasSelectedItems = selectedCount > 0;
		var $actions = $('.ngBetterInterface-floating-actions button, .ngBetterInterface-floating-actions input[type="submit"], .ngBetterInterface-floating-actions select');
		var $customButtons = $('.ngBetterInterface-trash-button, .ngBetterInterface-edit-button, .ngBetterInterface-update-button');
		var $counter = $('.ngBetterInterface-selection-counter');
		
		// Récupérer le nom des éléments depuis le titre de la page
		var itemName = 'items';
		var $pageTitle = $('h1.wp-heading-inline');
		if ($pageTitle.length > 0) {
			itemName = $pageTitle.text().trim().toLowerCase();
			// Nettoyer le nom (retirer les pluriels, articles, etc.)
			itemName = itemName.replace(/^all\s+/i, '').replace(/^manage\s+/i, '').replace(/^edit\s+/i, '');
			// Mettre au pluriel si nécessaire
			if (!itemName.endsWith('s')) {
				itemName += 's';
			}
		}
		
		// Mettre à jour le compteur avec effet de défilement
		var $counterNumber = $counter.find('.ngBetterInterface-counter-number');
		var currentValue = parseInt($counterNumber.text()) || 0;
		
		if (currentValue !== selectedCount) {
			// Ajouter la classe pour l'animation
			$counterNumber.addClass('counter-changing');
			
			// Mettre à jour la valeur après un court délai pour déclencher l'animation
			setTimeout(function(){
				$counterNumber.text(selectedCount);
				$counterNumber.removeClass('counter-changing');
			}, 50);
		}
		
		// Vérifier s'il y a des filtres actifs
		var hasActiveFilters = $('.ngBetterInterface-floating-filters').children().length > 0;
		
		// Afficher/masquer la barre selon les conditions avec animation
		var $floatingBar = $('.ngBetterInterface-floating-action-bar');
		if (hasSelectedItems || hasActiveFilters) {
			$floatingBar.removeClass('slide-out').addClass('slide-in');
		} else {
			$floatingBar.removeClass('slide-in').addClass('slide-out');
		}
		
		if (hasSelectedItems) {
			$actions.prop('disabled', false).removeClass('disabled');
			$customButtons.prop('disabled', false).removeClass('disabled');
			$counter.addClass('has-selection');
		} else {
			$actions.prop('disabled', true).addClass('disabled');
			$customButtons.prop('disabled', true).addClass('disabled');
			$counter.removeClass('has-selection');
		}
	};

	// Pourquoi: améliorer l'ergonomie des listes WP; un clic sur l'arrière-plan d'une ligne toggle la première case à cocher
	BetterInterfaceAdmin.prototype.bindRowBackgroundSelect = function(){
		var self = this;
		$(document).on('click', '.wp-list-table tbody tr', function(e){
			var $target = $(e.target);
			if (self.isInteractive($target)) return;
			var $row = $(this);
			var $checkbox = $row.find('th.check-column input[type="checkbox"], td.check-column input[type="checkbox"], input[type="checkbox"]').first();
			if ($checkbox.length === 0) return;
			var nextState = !$checkbox.prop('checked');
			$checkbox.prop('checked', nextState).trigger('change');
			self.updateRowSelectedState($row, nextState);
		});
	};

	// Pourquoi: garder l'état visuel de sélection en phase avec les cases à cocher (sélections individuelles et "tout sélectionner")
	BetterInterfaceAdmin.prototype.bindRowCheckboxSync = function(){
		var self = this;
		// Cases par ligne
		$(document).on('change', '.wp-list-table tbody tr input[type="checkbox"]', function(){
			var $row = $(this).closest('tr');
			self.updateRowSelectedState($row, $(this).prop('checked'));
		});
		// Cases "tout sélectionner" (thead/tfoot)
		$(document).on('change', '.wp-list-table thead input[type="checkbox"], .wp-list-table tfoot input[type="checkbox"]', function(){
			$('.wp-list-table tbody tr').each(function(){
				var $row = $(this);
				var $checkbox = $row.find('th.check-column input[type="checkbox"], td.check-column input[type="checkbox"]').first();
				if ($checkbox.length) {
					self.updateRowSelectedState($row, $checkbox.prop('checked'));
				}
			});
		});
	};

	// Met à jour la classe de sélection sur la ligne (pour les styles modernes)
	BetterInterfaceAdmin.prototype.updateRowSelectedState = function($row, isSelected){
		$row.toggleClass('ngBetterInterface-row-selected', !!isSelected);
	};

	// À l'init: synchroniser l'état visuel des lignes déjà sélectionnées
	BetterInterfaceAdmin.prototype.initializeSelectedRowsState = function(){
		var self = this;
		$('.wp-list-table tbody tr').each(function(){
			var $row = $(this);
			var $checkbox = $row.find('th.check-column input[type="checkbox"], td.check-column input[type="checkbox"]').first();
			if ($checkbox.length) {
				self.updateRowSelectedState($row, $checkbox.prop('checked'));
			}
		});
	};

	// ===== TRANSITION DE PAGE SMOOTH =====
	// Pourquoi: créer une transition fluide lors des changements de page pour une meilleure UX
	BetterInterfaceAdmin.prototype.initPageTransition = function(){
		var self = this;
		
		// Créer l'overlay de transition s'il n'existe pas
		if ($('.ngBetterInterface-page-transition-overlay').length === 0) {
			$('body').append('<div class="ngBetterInterface-page-transition-overlay"></div>');
		}

		// Intercepter les clics sur les liens de navigation
		$(document).on('click', 'a[href*="admin.php"], a[href*="post.php"], a[href*="edit.php"], a[href*="upload.php"], a[href*="users.php"], a[href*="plugins.php"], a[href*="themes.php"], a[href*="options-general.php"], a[href*="tools.php"], a[href*="edit-comments.php"]', function(e){
			var href = $(this).attr('href');
			
			// Ignorer les liens avec des ancres ou des paramètres spécifiques
			if (href.indexOf('#') === 0 || href.indexOf('javascript:') === 0) return;
			
			// Ignorer les liens qui ouvrent dans un nouvel onglet
			if ($(this).attr('target') === '_blank') return;
			
			// Ignorer les liens de téléchargement
			if (href.indexOf('download') !== -1 || href.indexOf('export') !== -1) return;
			
			// Activer la transition
			self.showPageTransition();
			
			// Délai pour permettre à l'animation de se déclencher
			setTimeout(function(){
				window.location.href = href;
			}, 300);
		});

		// Intercepter les soumissions de formulaires
		$(document).on('submit', 'form', function(e){
			var $form = $(this);
			var action = $form.attr('action') || '';
			
			// Ignorer les formulaires AJAX ou avec des actions spécifiques
			if ($form.hasClass('no-transition') || action.indexOf('ajax') !== -1) return;
			
			// Activer la transition
			self.showPageTransition();
		});

		// Intercepter les clics sur les boutons de sauvegarde du plugin
		$(document).on('click', '.ngBetterInterface-save-toggle, .ngBetterInterface-save-theme', function(){
			self.showPageTransition();
		});
	};

	// Afficher l'overlay de transition
	BetterInterfaceAdmin.prototype.showPageTransition = function(){
		$('.ngBetterInterface-page-transition-overlay').addClass('active');
	};

	// ===== SYSTÈME DE POSITIONNEMENT DES NOTICES =====
	// Pourquoi: organiser les notices WordPress en colonne verticale à droite pour éviter les superpositions
	BetterInterfaceAdmin.prototype.initNoticesPositioning = function(){
		var self = this;
		
		// Créer le container pour les notices s'il n'existe pas
		if ($('.ngBetterInterface-notices-container').length === 0) {
			$('body').append('<div class="ngBetterInterface-notices-container"></div>');
		}

		// Fonction pour déplacer une notice dans le container
		function moveNoticeToContainer($notice) {
			if ($notice.closest('.ngBetterInterface-notices-container').length === 0) {
				$('.ngBetterInterface-notices-container').append($notice);
			}
		}

		// Observer les nouvelles notices qui apparaissent
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				mutation.addedNodes.forEach(function(node) {
					if (node.nodeType === 1) { // Element node
						var $node = $(node);
						
						// Vérifier si c'est une notice ou contient des notices
						if ($node.hasClass('notice') || $node.hasClass('notice-success') || $node.hasClass('notice-error') || $node.hasClass('notice-warning') || $node.hasClass('notice-info')) {
							moveNoticeToContainer($node);
						}
						
						// Chercher des notices dans les enfants
						$node.find('.notice, .notice-success, .notice-error, .notice-warning, .notice-info').each(function() {
							moveNoticeToContainer($(this));
						});
					}
				});
			});
		});

		// Démarrer l'observation
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		// Déplacer les notices existantes
		$('.notice, .notice-success, .notice-error, .notice-warning, .notice-info').each(function() {
			moveNoticeToContainer($(this));
		});
	};

	$(function(){
		(new BetterInterfaceAdmin()).init();
	});
})(jQuery); 
