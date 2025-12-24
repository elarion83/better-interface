/**
 * AddButton: Gère la détection et la création du bouton "Ajouter" (+)
 * Extrait de createFloatingActionBar pour améliorer la lisibilité
 */
(function($) {
	window.AddButton = {
		/**
		 * Détecte et crée le bouton "Ajouter" personnalisé
		 * @returns {jQuery|null} - Élément jQuery du bouton ou null
		 */
		create: function() {
			var $addButton = null;
			
			// Tableau des conditions pour détecter les boutons "Ajouter"
			var addButtonConditions = [
				{
					selector: '.wrap h1.wp-heading-inline + a.page-title-action[href*="wp-admin/post-new.php"]',
					description: 'Bouton Ajouter WordPress standard'
				},
				{
					selector: '#wpcf7-contact-form-list-table h1 + a[href*="wpcf7-new"]',
					description: 'Bouton Ajouter Contact Form 7'
				},
				{
					selector: 'a.page-title-action[href*="plugin-install.php"]',
					description: 'Bouton Ajouter Plugins'
				},
				{
					selector: 'h1 + a.page-title-action[href*="user-new.php"]',
					description: 'Bouton Ajouter Utilisateur'
				}
				// Ajouter facilement d'autres conditions ici
				// {
				//     selector: 'SELECTEUR_CSS',
				//     description: 'Description du bouton'
				// }
			];
			
			// Chercher le premier bouton "Ajouter" qui correspond aux conditions
			var $originalAddButton = null;
			for (var i = 0; i < addButtonConditions.length; i++) {
				var condition = addButtonConditions[i];
				var $foundButton = $(condition.selector);
				if ($foundButton.length > 0) {
					$originalAddButton = $foundButton;
					break;
				}
			}
			
			if ($originalAddButton && $originalAddButton.length > 0) {
				var addButtonHref = $originalAddButton.attr('href');
				
				// Créer le gros bouton "Ajouter"
				$addButton = $('<a href="' + addButtonHref + '" class="ngWPAdminUI-add-button"><span class="material-icons">add</span></a>');
				
				// Masquer le bouton original
				$originalAddButton.hide();
			}
			
			return $addButton;
		}
	};
})(jQuery);

