(function($){
	// ToggleSelector: gère uniquement le toggle de l'affichage transformé et la sélection des thèmes
	function ToggleSelector(){
		// Pourquoi: utiliser la variable localisée correcte ngWPAdminUI_ajax au lieu de ngBetterInterface_ajax
		this.isTransformed = (window.ngWPAdminUI_ajax && ngWPAdminUI_ajax.current_mode === 'modern') || false;
		this.currentColorTheme = (window.ngWPAdminUI_ajax && ngWPAdminUI_ajax.current_color_theme) || 'midnight';
		this.availableColorThemes = (window.ngWPAdminUI_ajax && ngWPAdminUI_ajax.available_color_themes) || {};
		this.ajaxUrl = (window.ngWPAdminUI_ajax && ngWPAdminUI_ajax.ajax_url) || ajaxurl;
		this.nonce = (window.ngWPAdminUI_ajax && ngWPAdminUI_ajax.nonce) || '';

		this.selectedTransformed = null;
		this.selectedTheme = null;
	}

	ToggleSelector.prototype.init = function(){
		this.bindToggleSelection();
		this.bindThemeSelection();
		this.bindSaves();
		this.initializePreview();
	};

	// Pourquoi: permettre d'activer/désactiver l'affichage transformé
	ToggleSelector.prototype.bindToggleSelection = function(){
		var self = this;
		
		// Fonction pour mettre à jour l'affichage
		function updateDisplay(isTransformed) {
			var $card = $('.ngWPAdminUI-toggle-card');
			var $title = $('.ngWPAdminUI-toggle-text h3');
			var $description = $('.ngWPAdminUI-toggle-description');
			var $preview = $('.ngWPAdminUI-toggle-preview');
			var $toggle = $('#ngWPAdminUI-transformed-toggle');
			
			// Mettre à jour le checkbox
			$toggle.prop('checked', isTransformed);
			
			if (isTransformed) {
				$card.addClass('active');
				$title.text('Activé');
				$description.text('Interface moderne avec des couleurs vives et des animations fluides.');
				// Aperçu moderne avec des couleurs vives
				$preview.addClass('modern-preview');
			} else {
				$card.removeClass('active');
				$title.text('Désactivé');
				$description.text('Interface classique WordPress avec des améliorations subtiles.');
				// Aperçu classique avec des couleurs neutres
				$preview.removeClass('modern-preview');
			}
			
			$('.ngWPAdminUI-save-toggle').prop('disabled', false);
		}
		
		// Clic sur la carte entière
		$(document).on('click', '.ngWPAdminUI-toggle-card', function(e){
			// Éviter le double déclenchement si on clique directement sur le switch
			if ($(e.target).closest('.ngWPAdminUI-switch').length > 0) return;
			
			var $toggle = $('#ngWPAdminUI-transformed-toggle');
			var newState = !$toggle.is(':checked');
			self.selectedTransformed = newState;
			updateDisplay(newState);
		});
		
		// Changement direct du switch
		$(document).on('change', '#ngWPAdminUI-transformed-toggle', function(){
			var isTransformed = $(this).is(':checked');
			self.selectedTransformed = isTransformed;
			updateDisplay(isTransformed);
		});
	};

	// Pourquoi: permettre de choisir un thème couleur (affichage transformé uniquement)
	ToggleSelector.prototype.bindThemeSelection = function(){
		var self = this;
		$(document).on('click', '.ngWPAdminUI-theme-card', function(){
			var theme = $(this).data('theme');
			self.selectedTheme = theme;
			$('.ngWPAdminUI-theme-card').removeClass('active');
			$(this).addClass('active');
			$('.ngWPAdminUI-save-theme').prop('disabled', false);
		});
	};

	ToggleSelector.prototype.bindSaves = function(){
		var self = this;
		// Sauvegarde du toggle
		// Pourquoi: utiliser l'action AJAX correcte ngWPAdminUI_save_mode pour correspondre au hook WordPress
		$(document).on('click', '.ngWPAdminUI-save-toggle', function(){
			if(self.selectedTransformed === null) return;
			
			var mode = self.selectedTransformed ? 'modern' : 'default';
			$.post(self.ajaxUrl, {
				action: 'ngWPAdminUI_save_mode',
				nonce: self.nonce,
				mode: mode
			}).always(function(){
				window.location.reload();
			});
		});

		// Sauvegarde du thème
		// Pourquoi: utiliser l'action AJAX correcte ngWPAdminUI_save_color_theme pour correspondre au hook WordPress
		$(document).on('click', '.ngWPAdminUI-save-theme', function(){
			if(!self.selectedTheme) return;
			$.post(self.ajaxUrl, {
				action: 'ngWPAdminUI_save_color_theme',
				nonce: self.nonce,
				theme: self.selectedTheme
			}).always(function(){
				window.location.reload();
			});
		});
	};

	// Initialiser l'aperçu selon l'état actuel
	ToggleSelector.prototype.initializePreview = function(){
		var $preview = $('.ngWPAdminUI-toggle-preview');
		if (this.isTransformed) {
			$preview.addClass('modern-preview');
		} else {
			$preview.removeClass('modern-preview');
		}
	};

	$(function(){
		(new ToggleSelector()).init();
	});
})(jQuery);
