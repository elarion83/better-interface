/**
 * SelectionCounter: Gère le compteur d'éléments sélectionnés
 * Extrait de createFloatingActionBar pour améliorer la lisibilité
 */
(function($) {
	window.SelectionCounter = {
		/**
		 * Crée le compteur d'éléments sélectionnés avec bouton de désélection
		 * @param {number} totalItems - Nombre total d'éléments
		 * @param {string} itemName - Nom des éléments
		 * @returns {jQuery} - Élément jQuery du compteur
		 */
		create: function(totalItems, itemName) {
			// Pourquoi: utiliser la variable localisée correcte ngWPAdminUI_ajax
			var deselectAllText = (window.ngWPAdminUI_ajax && ngWPAdminUI_ajax.i18n && ngWPAdminUI_ajax.i18n.deselect_all) || 'Deselect';
			var $counter = $('<div class="ngWPAdminUI-selection-counter"><div class="ngWPAdminUI-counter-content"><span class="ngWPAdminUI-counter-number">' + totalItems + '</span><span class="ngWPAdminUI-counter-text">' + itemName + '</span></div><button type="button" class="ngWPAdminUI-deselect-all" title="' + deselectAllText + '"><span class="dashicons dashicons-no-alt"></span></button></div>');
			
			// Configurer le bouton de désélection
			$counter.find('.ngWPAdminUI-deselect-all').on('click', function(e){
				e.preventDefault();
				e.stopPropagation();
				
				// Désélectionner toutes les cases à cocher
				$('.wp-list-table tbody input[type="checkbox"]:checked').prop('checked', false).trigger('change');
				
				// Désélectionner les cases "tout sélectionner"
				$('.wp-list-table thead input[type="checkbox"], .wp-list-table tfoot input[type="checkbox"]').prop('checked', false).trigger('change');
			});
			
			return $counter;
		},
		
		/**
		 * Récupère le nom des éléments depuis le titre de la page
		 * @returns {string} - Nom des éléments
		 */
		getItemName: function() {
			var itemName = 'selected';
			var $pageTitle = $('h1.wp-heading-inline');
			if ($pageTitle.length > 0) {
				itemName = $pageTitle.text().trim().toLowerCase();
				// Nettoyer le nom (retirer les pluriels, articles, etc.)
				itemName = itemName.replace(/^all\s+/i, '').replace(/^manage\s+/i, '').replace(/^edit\s+/i, '');
			}
			return itemName;
		},
		
		/**
		 * Récupère le nombre total d'éléments depuis .displaying-num
		 * @returns {number} - Nombre total d'éléments
		 */
		getTotalItems: function() {
			var totalItems = 0;
			var $displayingNum = $('.displaying-num');
			if ($displayingNum.length > 0) {
				var displayingText = $displayingNum.text().trim();
				// Extraire le nombre du texte (gère différents formats)
				// "Showing 1-20 of 100 items" -> 100
				// "100 items" -> 100
				// "Showing 1-20 of 100" -> 100
				var match = displayingText.match(/(\d+)(?=\s*(?:items?|$))/i) || displayingText.match(/(\d+)$/);
				if (match) {
					totalItems = parseInt(match[1]);
				}
			}
			return totalItems;
		}
	};
})(jQuery);

