<?php

if (!function_exists('formatDui')) {
    /**
     * Formatea un DUI de 9 dígitos al formato ########-#
     *
     * @param string|null $dui
     * @return string|null
     */
    function formatDui(?string $dui): ?string
    {
        if (!$dui || strlen($dui) !== 9) {
            return $dui;
        }

        return substr($dui, 0, 8) . '-' . substr($dui, 8, 1);
    }
}

if (!function_exists('formatPhone')) {
    /**
     * Formatea un teléfono de 8 dígitos al formato ####-####
     *
     * @param string|null $phone
     * @return string|null
     */
    function formatPhone(?string $phone): ?string
    {
        if (!$phone || strlen($phone) !== 8) {
            return $phone;
        }

        return substr($phone, 0, 4) . '-' . substr($phone, 4, 4);
    }
}
