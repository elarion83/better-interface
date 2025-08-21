/**
 * Better Interface - Application automatique des styles modernes
 * Applique les classes modernes aux éléments WordPress appropriés
 */

(function($) {
    'use strict';
    
    // Configuration des sélecteurs pour l'application automatique
    var modernStylesConfig = {
        // Boutons à styler automatiquement
        buttons: [
            // Boutons principaux de WordPress
            '.wp-core-ui .button-primary',
            '.wp-core-ui .button-secondary',
            
            // Boutons dans les formulaires
            'form .button',
            'form .button-primary',
            'form .button-secondary',
            
            // Boutons dans les tableaux
            '.wp-list-table .button',
            '.tablenav .button',
            
            // Boutons dans les métaboxes
            '.postbox .button',
            '.meta-box-sortables .button'
        ],
        
        // Éléments à exclure (ne pas styler)
        exclude: [
            // Éléments spécifiques à exclure
            '.column-title button',
            '.row-actions button',
            '.handle-actions button',
            '#screen-meta-links button',
            '#minor-publishing button',
            '.notice-dismiss',
            '.media-frame-content button',
            '.mce-container button',
            '#wp-content-editor-tools button',
            '.interface-interface-skeleton__editor button',
            '.components-popover button',
            '#collapse-menu button',
            '.ngBetterInterface-floating-actions button',
            '.ngBetterInterface-custom-button', // Nos boutons personnalisés
            '.ngBetterInterface-trash-button',
            '.ngBetterInterface-approve-button',
            '.ngBetterInterface-unapprove-button',
            '.ngBetterInterface-activate-button',
            '.ngBetterInterface-deactivate-button',
            '.ngBetterInterface-spam-button',
            '.ngBetterInterface-unspam-button',
            '.ngBetterInterface-reset-password-button',
            '.ngBetterInterface-enable-auto-update-button',
            '.ngBetterInterface-disable-auto-update-button',
            '.ngBetterInterface-edit-button',
            '.ngBetterInterface-update-button',
            '.ngBetterInterface-untrash-button'
        ]
    };
    
    /**
     * Applique les styles modernes aux éléments
     */
    function applyModernStyles() {
        // Appliquer aux boutons
        modernStylesConfig.buttons.forEach(function(selector) {
            $(selector).each(function() {
                var $element = $(this);
                
                // Vérifier si l'élément doit être exclu
                var shouldExclude = false;
                modernStylesConfig.exclude.forEach(function(excludeSelector) {
                    if ($element.is(excludeSelector) || $element.closest(excludeSelector).length > 0) {
                        shouldExclude = true;
                        return false; // break
                    }
                });
                
                // Appliquer la classe si pas exclu et pas déjà appliquée
                if (!shouldExclude && !$element.hasClass('ngBetterInterface-modern-button')) {
                    $element.addClass('ngBetterInterface-modern-button');
                }
            });
        });
    }
    
    /**
     * Initialise l'application des styles modernes
     */
    function initModernStyles() {
        // Appliquer immédiatement
        applyModernStyles();
        
        // Observer les changements DOM pour les éléments dynamiques
        if (window.MutationObserver) {
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // Attendre un peu pour que le DOM soit stable
                        setTimeout(applyModernStyles, 100);
                    }
                });
            });
            
            // Observer le body pour les changements
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        // Réappliquer sur les événements AJAX
        $(document).ajaxComplete(function() {
            setTimeout(applyModernStyles, 100);
        });
    }
    
    // Initialiser quand le DOM est prêt
    $(document).ready(function() {
        initModernStyles();
    });
    
})(jQuery);
