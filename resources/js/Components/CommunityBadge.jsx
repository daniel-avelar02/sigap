/**
 * Objeto que mapea los nombres de las comunidades a sus correspondientes clases de color de fondo de Tailwind CSS.
 * Se utiliza para renderizar insignias (badges) con colores distintivos para cada comunidad.
 *
 * @constant
 * @type {Object.<string, string>}
 * @property {string} 'La Pandeadura' - Color amarillo.
 * @property {string} 'La Puerta' - Color naranja.
 * @property {string} 'Loma Larga' - Color morado.
 * @property {string} 'Rodeo 1' - Color rojo.
 * @property {string} 'Rodeo 2' - Color rosa.
 * @property {string} 'San Francisco' - Color verde.
 * @property {string} 'San Rafael' - Color azul.
 * @property {string} 'San Rafael (Los Pinos)' - Color cian.
 */
const COMMUNITY_COLORS = {
    'La Pandeadura': 'bg-yellow-500',
    'La Puerta': 'bg-orange-500',
    'Loma Larga': 'bg-purple-500',
    'Rodeo 1': 'bg-red-500',
    'Rodeo 2': 'bg-pink-500',
    'San Francisco': 'bg-green-500',
    'San Rafael': 'bg-blue-500',
    'San Rafael (Los Pinos)': 'bg-cyan-500',
};

export default function CommunityBadge({ community, size = 'md' }) {
    const colorClass = COMMUNITY_COLORS[community] || 'bg-gray-500';
    
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium text-white ${colorClass} ${sizeClasses[size]}`}
        >
            {community}
        </span>
    );
}
