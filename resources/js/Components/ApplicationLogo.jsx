export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Gota de agua principal */}
            <path
                d="M50 15 C50 15, 35 35, 35 50 C35 58.284 41.716 65 50 65 C58.284 65 65 58.284 65 50 C65 35, 50 15, 50 15 Z"
                fill="#2563eb"
            />
            
            {/* Reflejo en la gota */}
            <ellipse
                cx="45"
                cy="45"
                rx="8"
                ry="12"
                fill="#60a5fa"
                opacity="0.4"
            />
            
            {/* Tubería ondulada horizontal */}
            <path
                d="M10 75 Q20 70, 30 75 T50 75 T70 75 T90 75"
                stroke="#60a5fa"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
            />
            
            {/* Sombra de la tubería */}
            <path
                d="M10 78 Q20 73, 30 78 T50 78 T70 78 T90 78"
                stroke="#2563eb"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                opacity="0.3"
            />
            
            {/* Gotas pequeñas cayendo */}
            <circle cx="42" cy="70" r="2.5" fill="#60a5fa" opacity="0.6" />
            <circle cx="58" cy="68" r="2" fill="#60a5fa" opacity="0.5" />
            <circle cx="50" cy="72" r="1.8" fill="#2563eb" opacity="0.4" />
        </svg>
    );
}
