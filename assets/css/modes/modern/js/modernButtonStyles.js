/**
 * WP Admin UI - Application automatique des styles modernes
 * Applique les classes modernes aux éléments WordPress appropriés
 */

(function($) {
    'use strict';
    
    // Configuration des sélecteurs pour l'application automatique
    var modernButtonStylesConfig = {
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
            '.meta-box-sortables .button',
            '#collapse-menu button',
            '.ngWPAdminUI-filters-panel-content input[type="submit"]'
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
            '.ngWPAdminUI-floating-actions button',
            'form#addtag button.upload_image_button'
        ],
        
        // Configuration des exclusions de propriétés par sélecteur
        propertyExclusions: {
            '#collapse-menu button': ['border-radius'],
            // Exemple: '.mon-bouton-specifique': ['border-radius', 'shadow']
            // Format: 'sélecteur': ['propriété1', 'propriété2']
        },
        
        // Classes d'exclusion automatiques basées sur les attributs data
        dataExclusions: {
            'data-no-border-radius': 'ngWPAdminUI-no-border-radius',
            'data-no-shadow': 'ngWPAdminUI-no-shadow',
            'data-no-gradient': 'ngWPAdminUI-no-gradient',
            'data-no-transition': 'ngWPAdminUI-no-transition',
            'data-no-hover': 'ngWPAdminUI-no-hover'
        }
    };
    
    /**
     * Applique les styles modernes aux éléments
     */
    function applyModernButtonStyles() {
        // Appliquer aux boutons
        modernButtonStylesConfig.buttons.forEach(function(selector) {
            $(selector).each(function() {
                var $element = $(this);
                
                // Vérifier si l'élément doit être exclu
                var shouldExclude = false;
                modernButtonStylesConfig.exclude.forEach(function(excludeSelector) {
                    if ($element.is(excludeSelector) || $element.closest(excludeSelector).length > 0) {
                        shouldExclude = true;
                        return false; // break
                    }
                });
                
                // Appliquer la classe si pas exclu et pas déjà appliquée
                if (!shouldExclude && !$element.hasClass('ngWPAdminUI-modern-button')) {
                    $element.addClass('ngWPAdminUI-modern-button');
                    
                    // Appliquer les classes d'exclusion basées sur les attributs data
                    Object.keys(modernButtonStylesConfig.dataExclusions).forEach(function(dataAttr) {
                        if ($element.attr(dataAttr)) {
                            $element.addClass(modernButtonStylesConfig.dataExclusions[dataAttr]);
                        }
                    });
                    
                    // Appliquer les exclusions de propriétés configurées
                    Object.keys(modernButtonStylesConfig.propertyExclusions).forEach(function(selector) {
                        if ($element.is(selector)) {
                            modernButtonStylesConfig.propertyExclusions[selector].forEach(function(property) {
                                var exclusionClass = 'ngWPAdminUI-no-' + property;
                                $element.addClass(exclusionClass);
                            });
                        }
                    });
                }
            });
        });
    }
    
    /**
     * Initialise l'application des styles modernes
     */
    function initModernButtonStyles() {
        // Appliquer immédiatement
        applyModernButtonStyles();
        
        // Observer les changements DOM pour les éléments dynamiques
        if (window.MutationObserver) {
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // Attendre un peu pour que le DOM soit stable
                        setTimeout(applyModernButtonStyles, 100);
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
            setTimeout(applyModernButtonStyles, 100);
        });
    }
    
    // Initialiser quand le DOM est prêt
    $(document).ready(function() {
        initModernButtonStyles();
    });
    
})(jQuery);
