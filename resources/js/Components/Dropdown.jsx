import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { createContext, useContext, useState, useEffect, useRef } from 'react';


const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);

    return (
        <>
            <div onClick={toggleOpen}>{children}</div>

            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    direction = 'down',
    contentClasses = 'py-1 bg-white',
    children,
}) => {
    const { open, setOpen } = useContext(DropDownContext);
    const [position, setPosition] = useState({ top: 0, left: 0, right: 0 });
    const contentRef = useRef(null);

    useEffect(() => {
        if (open && contentRef.current) {
            const trigger = contentRef.current.parentElement;
            const rect = trigger.getBoundingClientRect();
            
            let newPosition = {};
            
            if (direction === 'up') {
                newPosition.bottom = window.innerHeight - rect.top + 8;
            } else {
                newPosition.top = rect.bottom + 8;
            }
            
            if (align === 'left') {
                newPosition.left = rect.left;
            } else if (align === 'right') {
                newPosition.right = window.innerWidth - rect.right;
            }
            
            setPosition(newPosition);
        }
    }, [open, align, direction]);

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = direction === 'up' 
            ? 'origin-bottom-left' 
            : 'origin-top-left';
    } else if (align === 'right') {
        alignmentClasses = direction === 'up'
            ? 'origin-bottom-right'
            : 'origin-top-right';
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    }

    const positionStyle = {
        top: position.top !== undefined ? `${position.top}px` : undefined,
        bottom: position.bottom !== undefined ? `${position.bottom}px` : undefined,
        left: position.left !== undefined ? `${position.left}px` : undefined,
        right: position.right !== undefined ? `${position.right}px` : undefined,
    };

    return (
        <>
            <div ref={contentRef} style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }} />
            <Transition
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    className={`fixed z-[100] rounded-md shadow-lg ${alignmentClasses} ${widthClasses}`}
                    style={positionStyle}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className={
                            `rounded-md ring-1 ring-black ring-opacity-5 ` +
                            contentClasses
                        }
                    >
                        {children}
                    </div>
                </div>
            </Transition>
        </>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
