(function($){
	// ToggleSelector: gère uniquement le toggle de l'affichage transformé et la sélection des thèmes
	function ToggleSelector(){
		this.isTransformed = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.current_mode === 'modern') || false;
		this.currentColorTheme = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.current_color_theme) || 'ocean';
		this.availableColorThemes = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.available_color_themes) || {};
		this.ajaxUrl = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.ajax_url) || ajaxurl;
		this.nonce = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.nonce) || '';

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
			var $card = $('.ngBetterInterface-toggle-card');
			var $title = $('.ngBetterInterface-toggle-text h3');
			var $description = $('.ngBetterInterface-toggle-description');
			var $preview = $('.ngBetterInterface-toggle-preview');
			var $toggle = $('#ngBetterInterface-transformed-toggle');
			
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
			
			$('.ngBetterInterface-save-toggle').prop('disabled', false);
		}
		
		// Clic sur la carte entière
		$(document).on('click', '.ngBetterInterface-toggle-card', function(e){
			// Éviter le double déclenchement si on clique directement sur le switch
			if ($(e.target).closest('.ngBetterInterface-switch').length > 0) return;
			
			var $toggle = $('#ngBetterInterface-transformed-toggle');
			var newState = !$toggle.is(':checked');
			self.selectedTransformed = newState;
			updateDisplay(newState);
		});
		
		// Changement direct du switch
		$(document).on('change', '#ngBetterInterface-transformed-toggle', function(){
			var isTransformed = $(this).is(':checked');
			self.selectedTransformed = isTransformed;
			updateDisplay(isTransformed);
		});
	};

	// Pourquoi: permettre de choisir un thème couleur (affichage transformé uniquement)
	ToggleSelector.prototype.bindThemeSelection = function(){
		var self = this;
		$(document).on('click', '.ngBetterInterface-theme-card', function(){
			var theme = $(this).data('theme');
			self.selectedTheme = theme;
			$('.ngBetterInterface-theme-card').removeClass('active');
			$(this).addClass('active');
			$('.ngBetterInterface-save-theme').prop('disabled', false);
		});
	};

	ToggleSelector.prototype.bindSaves = function(){
		var self = this;
		// Sauvegarde du toggle
		$(document).on('click', '.ngBetterInterface-save-toggle', function(){
			if(self.selectedTransformed === null) return;
			
			var mode = self.selectedTransformed ? 'modern' : 'default';
			$.post(self.ajaxUrl, {
				action: 'ngBetterInterface_save_mode',
				nonce: self.nonce,
				mode: mode
			}).always(function(){
				window.location.reload();
			});
		});

		// Sauvegarde du thème
		$(document).on('click', '.ngBetterInterface-save-theme', function(){
			if(!self.selectedTheme) return;
			$.post(self.ajaxUrl, {
				action: 'ngBetterInterface_save_color_theme',
				nonce: self.nonce,
				theme: self.selectedTheme
			}).always(function(){
				window.location.reload();
			});
		});
	};

	// Initialiser l'aperçu selon l'état actuel
	ToggleSelector.prototype.initializePreview = function(){
		var $preview = $('.ngBetterInterface-toggle-preview');
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
