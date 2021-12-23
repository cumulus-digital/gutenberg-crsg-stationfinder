<?php

namespace CRSG\Wordpress\Gutenberg\StationFinder;

/**
 * Plugin Name: CRSG Station Finder
 * Plugin URI: https://github.com/cumulus-digital/gutenberg-crsg-stationfinder/
 * Description: Gutenberg block for including data from the Cumulus Media Station Finder
 * Version: 2.0.13
 * Author: vena
 * License: GPL2+
 * License URI: https://www.gnu.org/licenses/gpl-2.0.txt
 * GitHub Plugin URI: cumulus-digital/gutenberg-crsg-stationfinder
 *
 * @category Gutenberg
 * @author vena
 * @version 2.0.10
 */
// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

// Editor Assets
function editor_assets()
{
    $url = \untrailingslashit(\plugin_dir_url(__FILE__));

    $assets = include(\plugin_dir_path(__FILE__) . 'build/backend.asset.php');
    \wp_enqueue_script(
        'crsg-stationfinder-backend-js', // Handle.
        $url . '/build/backend.js',
        $assets['dependencies'],
        $assets['version'],
        true
    );

    \wp_enqueue_style(
        'crsg-stationfinder-backend-css', // Handle.
        $url . '/build/backend.css',
        array( 'wp-edit-blocks' )
    );
}
\add_action('enqueue_block_editor_assets', __NAMESPACE__ . '\\editor_assets');

// Frontend Assets
function frontend_assets()
{
    if (has_block('cumulus-gutenberg/block-crsg-stationfinder')) {
        $url = \untrailingslashit(\plugin_dir_url(__FILE__));

        $assets = include(\plugin_dir_path(__FILE__) . 'build/frontend.asset.php');
        \wp_enqueue_script(
            'crsg-stationfinder-frontend-js', // Handle.
            $url . '/build/frontend.js',
            $assets['dependencies'],
            $assets['version'],
            true
        );

        \wp_enqueue_style(
            'crsg-stationfinder-frontend-css', // Handle.
            $url . '/build/frontend.css'
        );
    }
}
\add_action('enqueue_block_assets', __NAMESPACE__ . '\\frontend_assets');
