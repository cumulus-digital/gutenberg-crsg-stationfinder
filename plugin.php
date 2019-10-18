<?php
/**
 * Plugin Name: CRSG Station Finder
 * Plugin URI: https://github.com/cumulus-digital/gutenberg-crsg-stationfinder/
 * Description: A Wordpress Gutenberg block implementing a front-end, dynamic station finder UI.
 * Author: vena
 * Version: 1.0.1
 * License: GPL2+
 * License URI: https://www.gnu.org/licenses/gpl-2.0.txt
 * GitHub Plugin URI: cumulus-digital/gutenberg-crsg-stationfinder
 *
 * @package CGB
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Block Initializer.
 */
require_once plugin_dir_path( __FILE__ ) . 'src/init.php';
