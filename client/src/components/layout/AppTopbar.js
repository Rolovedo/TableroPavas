import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { RiUserSettingsLine, RiSearchLine, RiNotification2Line } from "react-icons/ri";
import UserMenuSidebar from "./UserMenuSidebar";
import SearchModal from "./SearchModal";
import { useSocket } from "@context/socket/SocketContext";
import Axios from "axios";
import { updateNotificationView } from "@utils/observables";
import { useContext, useRef } from "react";
import { AuthContext } from "@context/auth/AuthContext";
import useHandleApiError from "@hook/useHandleApiError";
import Notifications from "@components/ui/Notifications";
import { AppContext } from "@context/app/AppContext";
import { ToastContext } from "@context/toast/ToastContext";

export const AppTopbar = (props) => {
    const [visibleUserMenuSidebar, setVisibleUserMenuSidebar] = useState(false);
    const [visibleSearchModal, setVisibleSearchModal] = useState(false); // Estado para el modal de búsqueda

    const { idusuario } = useContext(AuthContext);
    const handleApiError = useHandleApiError();
    const socket = useSocket();
    const usuarioRef = useRef(idusuario);
    const { handleDofetchAppointments } = useContext(AppContext);
    const { showInfoBottomLeft } = useContext(ToastContext);
    const [unreadCount, setUnreadCount] = useState(0);
    const [shouldShake, setShouldShake] = useState(false);
    const [visibleNotifications, setVisibleNotifications] = useState(false);

    const shakeAnimation = (times) => {
        let count = 0;

        const shake = () => {
            setShouldShake(true);
            setTimeout(() => {
                setShouldShake(false);
                count++;
                if (count < times) {
                    setTimeout(shake, 50);
                }
            }, 2000);
        };

        shake();
    };

    useEffect(() => {
        usuarioRef.current = idusuario;
    }, [idusuario]);

    useEffect(() => {
        const getNotificationsCount = async () => {
            try {
                const { data } = await Axios.get("api/notifications/get_notification_count", {
                    params: { userId: idusuario },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("tokenCAJEROSSOPORTICA")}`,
                    },
                });
                setUnreadCount(data);
                if (data > 0) shakeAnimation(3);
            } catch (error) {
                handleApiError(error);
            }
        };

        if (idusuario) getNotificationsCount();
    }, [idusuario, handleApiError]);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (data) => {
            if (Number(idusuario) === Number(data.usu_id)) {
                setUnreadCount((prev) => prev + 1);
                shakeAnimation(3);
                handleDofetchAppointments(true);
                showInfoBottomLeft(data.not_mensaje || "Tienes una nueva notificación");
            }
        };

        socket.on("newNotification", handleNewNotification);

        const subscription = updateNotificationView.getNotification().subscribe((tipo) => {
            if (tipo === "allRead") {
                setUnreadCount(0);
            } else if (tipo === "singleRead") {
                setUnreadCount((prev) => Math.max(prev - 1, 0));
            }
        });

        return () => {
            socket.off("newNotification", handleNewNotification); // Solo quita el listener
            subscription.unsubscribe();
            // No hagas socket.disconnect();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, idusuario]);

    // const { stores, selectedStore, setSelectedStore } = useContext(AuthContext);
    // const location = useLocation(); // Hook para obtener la ubicación actual
    // const [isInventoryPage, setIsInventoryPage] = useState(false);

    // useEffect(() => {
    //     const currentPath = location.pathname;

    //     // Detectar si la ruta es "/inventory" o "/inventory/:id" o "/indicator-inventory" o "/indicator-inventory/:id"
    //     const isInventoryOrIndicator =
    //         currentPath === "/inventory" || currentPath === "/indicator-inventory";

    //     setIsInventoryPage(isInventoryOrIndicator); // Actualiza el estado con base en cualquiera de las dos rutas
    // }, [location.pathname]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Si el usuario presiona CTRL + B
            if (e.ctrlKey && e.key.toLowerCase() === "b") {
                setVisibleSearchModal((prev) => !prev);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div className="layout-topbar">
            <Link to={idusuario ? "/dashboard" : "/"} className="layout-topbar-logo">
                <img
                    src={`${process.env.PUBLIC_URL}/images/logos/logoPavasStay.png`}
                    alt="Logo Pavas"
                    width={120}
                    height="auto"
                    style={{ maxHeight: '40px', objectFit: 'contain' }}
                />{" "}
            </Link>

            <div className="layout-topbar-menu-button ">
                <div className="notification-wrapper">
                    <button
                        className={`p-link layout-topbar-button notification-button ${
                            shouldShake ? "shake" : ""
                        }`}
                        onClick={() => setVisibleNotifications((prev) => !prev)}
                        aria-label="Abrir notificaciones"
                    >
                        <RiNotification2Line size={18} />
                        <span>Notificaciones</span>
                    </button>
                    {unreadCount > 0 && <span className="dot-notification" />}
                </div>

                <button
                    className="p-link layout-topbar-button"
                    type="button"
                    onClick={() => setVisibleUserMenuSidebar(true)}
                >
                    <i className="pi pi-ellipsis-v" />
                </button>
            </div>

            <div className="layout-menu-button">
                <button
                    type="button"
                    className="p-link link-button layout-topbar-button"
                    onClick={props.onToggleMenuClick}
                >
                    <i className="pi pi-bars" />
                </button>
                <button
                    className="p-link layout-topbar-button"
                    onClick={() => setVisibleSearchModal(true)}
                    aria-label="Abrir buscador"
                >
                    <RiSearchLine size={18} />
                    <span>Buscar</span>
                </button>
            </div>
            <ul
                className={classNames("layout-topbar-menu lg:flex origin-top", {
                    "layout-topbar-menu-mobile-active": props.mobileTopbarMenuActive,
                })}
            >
                {/* {isInventoryPage && (
                    <li>
                        <Dropdown
                            {...propsSelect}
                            value={selectedStore}
                            options={stores}
                            onChange={(e) => setSelectedStore(e.value)}
                            placeholder="Selecciona una bodega"
                            className="custom-dropdown"
                            showClear={false}
                            disabled={stores.length === 0}
                        />
                    </li>
                )} */}
                <li>
                    <div className="notification-wrapper">
                        <button
                            className={`p-link layout-topbar-button notification-button ${
                                shouldShake ? "shake" : ""
                            }`}
                            onClick={() => setVisibleNotifications((prev) => !prev)}
                            aria-label="Abrir notificaciones"
                        >
                            <RiNotification2Line size={18} />
                            <span>Notificaciones</span>
                        </button>
                        {unreadCount > 0 && <span className="dot-notification" />}
                    </div>
                </li>
                <li>
                    <button
                        className="p-link layout-topbar-button"
                        onClick={() => setVisibleUserMenuSidebar(true)}
                    >
                        <RiUserSettingsLine size={18} />
                        <span>Menú de Usuario</span>
                    </button>
                </li>
            </ul>

            {/* Modal de búsqueda */}
            {visibleSearchModal && (
                <SearchModal
                    onClose={() => setVisibleSearchModal(false)}
                    menureal={props.menureal}
                />
            )}

            {visibleNotifications && (
                <Notifications
                    visible={visibleNotifications}
                    onClose={() => setVisibleNotifications(false)}
                    unreadCount={unreadCount}
                />
            )}

            {visibleUserMenuSidebar && (
                <UserMenuSidebar
                    visible={visibleUserMenuSidebar}
                    onClose={() => setVisibleUserMenuSidebar(false)}
                />
            )}
        </div>
    );
};
