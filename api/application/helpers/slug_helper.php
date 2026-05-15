<?php
defined('BASEPATH') OR exit('No direct script access allowed');

if ( ! function_exists('generate_slug'))
{
    /**
     * Generate a URL-friendly slug from text.
     *
     * @param string $text       The text to convert
     * @param string $separator  Word separator (default: hyphen)
     * @return string
     */
    function generate_slug($text, $separator = '-')
    {
        $text = mb_strtolower(trim($text), 'UTF-8');

        // Transliterate common non-ASCII characters
        $transliteration = array(
            'a' => 'á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ|ä|å|æ',
            'e' => 'é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ|ë',
            'i' => 'í|ì|ỉ|ĩ|ị|ï',
            'o' => 'ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ|ö|ø',
            'u' => 'ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự|ü',
            'y' => 'ý|ỳ|ỷ|ỹ|ỵ',
            'n' => 'ñ',
            'c' => 'ç',
            's' => 'ß',
            'd' => 'đ',
        );

        foreach ($transliteration as $replacement => $pattern) {
            $text = preg_replace('/(' . $pattern . ')/u', $replacement, $text);
        }

        // Remove possessives
        $text = preg_replace("/['`]/", '', $text);

        // Replace non-alphanumeric characters with the separator
        $text = preg_replace('/[^a-z0-9\s' . preg_quote($separator) . ']/', '', $text);

        // Replace whitespace and repeated separators with a single separator
        $text = preg_replace('/[\s' . preg_quote($separator) . ']+/', $separator, $text);

        // Trim separators from ends
        $text = trim($text, $separator);

        return $text;
    }
}

if ( ! function_exists('unique_slug'))
{
    /**
     * Generate a unique slug by checking against a database table.
     *
     * @param string $text       The text to convert
     * @param string $table      Database table name
     * @param string $column     Slug column name (default: 'slug')
     * @param int    $exclude_id ID to exclude (for updates)
     * @param string $id_column  ID column name (default: 'id')
     * @return string
     */
    function unique_slug($text, $table, $column = 'slug', $exclude_id = NULL, $id_column = 'id')
    {
        $CI =& get_instance();
        $slug = generate_slug($text);
        $original_slug = $slug;
        $counter = 1;

        while (TRUE) {
            $CI->db->where($column, $slug);
            if ($exclude_id !== NULL) {
                $CI->db->where($id_column . ' !=', $exclude_id);
            }
            $exists = $CI->db->count_all_results($table);

            if ($exists === 0) {
                break;
            }

            $counter++;
            $slug = $original_slug . '-' . $counter;
        }

        return $slug;
    }
}
