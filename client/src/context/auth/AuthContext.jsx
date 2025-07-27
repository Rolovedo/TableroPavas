import React, { createContext, useContext, useEffect, useReducer, useState } from "react";
import { authReducer } from "./authReducer";
import { ToastContext } from "../toast/ToastContext";
import Axios from "axios";
import { headers, ruta } from "@utils/converAndConst";
import { loginAPI, validateTokenAPI } from "@api/requests";
// import { Dialog } from "primereact/dialog";
import { useSocket } from "@context/socket/SocketContext";
import Cookies from "js-cookie";

const initialState = {
    autentificado: false,
    usuFoto: null,
    idusuario: null,
    nombreusuario: null,
    perfil: null,
    agenda: null,
    instructor: null,
    permisos: [],
    cambioclave: null,
    stores: [],
    ventanas: [],
    selectedStore: localStorage.getItem("selectedStore")
        ? JSON.parse(localStorage.getItem("selectedStore"))
        : null,
};

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const { showError } = useContext(ToastContext);
    const [visible, setVisible] = useState(false);
    const socket = useSocket();

    // Validar el token
    useEffect(() => {
        let timeoutId;

        const usuId = Number(Cookies.get("idPONTO"));
        const currentPath = window.location.pathname;

        if (!usuId > 0) {
            if (currentPath !== "/") {
                alert("ALERTA DE CIERRE DE SESION");
                logout();
            }
            return;
        }

        const validarToken = async () => {
            try {
                await validateTokenAPI();

                dispatch({
                    type: "login",
                    payload: {
                        autentificado: Cookies.get("autentificadoPONTO") === "true",
                        usuId: Cookies.get("idPONTO"),
                        nombre: Cookies.get("usuarioPONTO"),
                        usuFoto: localStorage.getItem("usuFoto"), // Cambiado para tomar la foto del localStorage
                        usuario: Cookies.get("usuarioPONTO"),
                        correo: Cookies.get("correoPONTO"),
                        telefono: Cookies.get("telefonoPONTO"),
                        documento: Cookies.get("documentoPONTO"),
                        perfil: Number(Cookies.get("perfilPONTO")),
                        agenda: Number(Cookies.get("agendaPONTO")),
                        instructor: Number(Cookies.get("instructorPONTO")),
                        permisos: JSON.parse(Cookies.get("permisosPONTO")),
                        // ventanas: JSON.parse(Cookies.get("ventanasPONTO")) || [],
                        cambioclave: localStorage.getItem("cambioclave"),
                    },
                });
            } catch (error) {
                console.log({ error });

                timeoutId = setTimeout(() => {
                    alert("ALERTA DE CIERRE DE SESION");
                    logout();
                    setVisible(false);
                }, 5000);
            }
        };

        validarToken();
        return () => clearTimeout(timeoutId);
    }, [visible, showError]);

    // Actualizar permisos desde el API
    useEffect(() => {
        const abortController = new AbortController();
        const usuId = Number(Cookies.get("idPONTO"));

        if (usuId > 0) {
            Axios.get("api/app/get_permissions_user", {
                params: { usuId },
                headers: {
                    ...headers,
                    Authorization: `Bearer ${Cookies.get("tokenPONTO")}`,
                },
            })
                .then(({ data }) => {
                    console.log(data);

                    dispatch({ type: "setPermisos", payload: data.permissions });
                    Cookies.set("permisosPONTO", JSON.stringify(data.permissions));

                    dispatch({ type: "setVentanas", payload: data.windows });
                    Cookies.set("ventanasPONTO", JSON.stringify(data.windows));
                })
                .catch((error) => {
                    if (error.response) {
                        if (error.response.status === 404) return showError("Api no encontrada");
                        return showError(error.response?.data.message);
                    }
                    showError(error);
                });
        }

        return () => abortController.abort();
    }, [showError]);

    // Manejo del socket
    useEffect(() => {
        if (!socket) return;

        socket.on("connect", () => {
            console.log("Socket conectado:", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("Socket desconectado");
        });

        const handleUpdatePermissions = (data) => {
            const { usuId, updatedPermissions } = data;
            if (Number(Cookies.get("idPONTO")) === usuId) {
                dispatch({ type: "setPermisos", payload: updatedPermissions });
                Cookies.set("permisosPONTO", JSON.stringify(updatedPermissions));
            }
        };

        socket.on("update-permissions", handleUpdatePermissions);

        return () => {
            socket.off("disconnect");
            socket.off("connect");
            socket.off("update-permissions", handleUpdatePermissions);
        };
    }, [socket]);

    const login = async (usuario, clave) => {
        try {
            const { data } = await loginAPI(usuario, clave);
            const {
                usuId,
                usuFoto,
                nombre,
                perfil,
                agenda,
                instructor,
                correo,
                documento,
                telefono,
                token,
                permisos,
                ventanas,
                cambioclave,
            } = data;

            dispatch({
                type: "login",
                payload: { ...data, autentificado: true, usuFoto },
            });

            Cookies.set("idPONTO", usuId);
            Cookies.set("usuarioPONTO", nombre);
            localStorage.setItem("usuFoto", usuFoto);
            Cookies.set("usuario", usuario);
            Cookies.set("correoPONTO", correo);
            Cookies.set("telefonoPONTO", telefono);
            Cookies.set("documentoPONTO", documento);
            Cookies.set("perfilPONTO", perfil);
            Cookies.set("agendaPONTO", agenda);
            Cookies.set("instructorPONTO", instructor);
            Cookies.set("tokenPONTO", token);
            Cookies.set("autentificadoPONTO", true);
            Cookies.set("permisosPONTO", JSON.stringify(permisos));
            Cookies.set("ventanasPONTO", JSON.stringify(ventanas));
            localStorage.setItem("cambioclave", cambioclave);

            return data;
        } catch (error) {
            Cookies.remove("autentificadoPONTO");
            localStorage.setItem("cambioclave", 0);
            if (error.response) {
                if (error.response.status === 404) return showError("Api no encontrada");
                return showError(error.response?.data.message);
            }
        }
    };

    const logout = async () => {
        dispatch({ type: "logout" });

        Cookies.remove("idPONTO");
        Cookies.remove("usuarioPONTO");
        Cookies.remove("autentificadoPONTO");
        Cookies.remove("perfilPONTO");
        Cookies.remove("correoPONTO");
        Cookies.remove("documentoPONTO");
        Cookies.remove("telefonoPONTO");
        Cookies.remove("perfilPONTO");
        Cookies.remove("agendaPONTO");
        Cookies.remove("instructorPONTO");
        Cookies.remove("permisosPONTO");
        Cookies.remove("ventanasPONTO");
        Cookies.remove("tokenPONTO");
        Cookies.remove("fotoPONTO");
        localStorage.removeItem("cambioclave");
        // localStorage.removeItem("sc-last-activity-time");
        window.location.href = ruta;
    };

    const setSelectedStore = (storeId) => {
        dispatch({ type: "setSelectedStore", payload: storeId });
        localStorage.setItem("selectedStore", JSON.stringify(storeId)); // Guardamos en localStorage
    };
    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                logout,
                setVisible,
                setSelectedStore,
            }}
        >
            {children}
            {/* <CloseApp visible={visible} /> */}
        </AuthContext.Provider>
    );
};
