/**
 * Componente modal de confirmación reutilizable.
 * Muestra un cuadro de diálogo con un título, un mensaje y botones de acción (confirmar/cancelar).
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {boolean} [props.show=false] - Controla la visibilidad del modal.
 * @param {string} [props.title='¿Está seguro?'] - El título que se muestra en la parte superior del modal.
 * @param {string} [props.message='Esta acción no se puede deshacer.'] - El mensaje descriptivo o advertencia para el usuario.
 * @param {string} [props.confirmText='Confirmar'] - El texto que se muestra en el botón de confirmación.
 * @param {string} [props.cancelText='Cancelar'] - El texto que se muestra en el botón de cancelación.
 * @param {boolean} [props.danger=false] - Si es verdadero, el botón de confirmación se renderiza como un botón de peligro (rojo). De lo contrario, es un botón primario estándar.
 * @param {function} [props.onConfirm=() => {}] - Función callback que se ejecuta cuando el usuario hace clic en el botón de confirmar.
 * @param {function} [props.onCancel=() => {}] - Función callback que se ejecuta cuando el usuario hace clic en cancelar o cierra el modal.
 * @returns {JSX.Element} El elemento modal renderizado.
 */

import Modal from './Modal';
import DangerButton from './DangerButton';
import SecondaryButton from './SecondaryButton';

export default function ConfirmModal({
    show = false,
    title = '¿Está seguro?',
    message = 'Esta acción no se puede deshacer.',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    danger = false,
    onConfirm = () => {},
    onCancel = () => {},
}) {
    return (
        <Modal show={show} onClose={onCancel} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    {title}
                </h2>

                <p className="mt-4 text-sm text-gray-600">
                    {message}
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onCancel}>
                        {cancelText}
                    </SecondaryButton>

                    {danger ? (
                        <DangerButton onClick={onConfirm}>
                            {confirmText}
                        </DangerButton>
                    ) : (
                        <button
                            onClick={onConfirm}
                            className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900"
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
