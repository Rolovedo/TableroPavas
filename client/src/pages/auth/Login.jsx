import React, { useContext, useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { AuthContext } from "@context/auth/AuthContext";
import Cookies from "js-cookie";

// Third-party Libraries
import { UnauthenticatedSessionControl } from "react-session-control";
import { useForm } from "react-hook-form";

// Custom Components
import { VenCambioClave } from "@components/generales/VenCambioClave";
import { VentanaRecuperar } from "@components/generales/VentanaRecuperar";
import LoginForm from "./LoginForm";

// Services
import authService from '../../services/auth.service';

import "./styles/login.css";

const Login = () => {
    const history = useHistory();
    const { login } = useContext(AuthContext);
    //const [visible, setVisible] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [loadingLogin, setLoadingLogin] = useState(false);
    const [activeForm, setActiveForm] = useState("login");
    
    // ← AGREGAR REF PARA CONTROLAR SI EL COMPONENTE ESTÁ MONTADO
    const isMountedRef = useRef(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            usuario: "",
            clave: "",
        },
    });

    // ← CLEANUP CUANDO EL COMPONENTE SE DESMONTA
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const onLoginUser = async ({ usuario, clave }) => {
        console.log('🔐 Iniciando login con Login.jsx...');
        
        // ← VERIFICAR SI EL COMPONENTE SIGUE MONTADO
        if (!isMountedRef.current) return;
        
        setLoadingLogin(true);

        try {
            // Login normal de PONTO
            const data = await login(usuario, clave);
            
            // ← VERIFICAR DESPUÉS DE OPERACIÓN ASYNC
            if (!isMountedRef.current) return;
            
            console.log('📊 Respuesta login:', data);

            if (!data) {
                if (isMountedRef.current) {
                    setLoadingLogin(false);
                }
                return;
            }

            const { cambioclave, usuId, perfil } = data;

            // Generar token para tablero después del login exitoso
            try {
                await authService.generateTableroToken(usuario, clave);
                console.log('✅ Token de tablero generado exitosamente');
            } catch (tokenError) {
                console.log('⚠️ Error generando token tablero, usando auth PONTO:', tokenError);
                authService.useExistingPontoAuth();
            }

            // ← VERIFICAR ANTES DE CONTINUAR
            if (!isMountedRef.current) return;

            // Verificar si hay token en cookies o en la respuesta
            const cookieToken = Cookies.get('token') || Cookies.get('authToken');
            
            if (cookieToken) {
                console.log('✅ Token encontrado en cookies, copiando a localStorage...');
                localStorage.setItem('token', cookieToken);
            }
            
            // También verificar si hay datos de usuario en cookies
            const userCookie = Cookies.get('user');
            if (userCookie) {
                localStorage.setItem('user', userCookie);
            }
            
            console.log('📋 Verificando localStorage después del login:');
            console.log('Token:', localStorage.getItem('token'));
            console.log('User:', localStorage.getItem('user'));

            // ← VERIFICAR ANTES DE ACTUALIZAR ESTADO
            if (!isMountedRef.current) return;

            // Verificar si necesita cambio de contraseña
            if (Number(cambioclave) === 1) {
                console.log('🔐 Requiere cambio de contraseña');
                Cookies.set("autentificadoCASAL", false);
                if (isMountedRef.current) {
                    setShowChangePasswordModal(true);
                    setLoadingLogin(false);
                }
                return;
            } else if (usuId > 0) {
                console.log('✅ Login exitoso, navegando...');
                
                // Guardar autenticación adicional
                localStorage.setItem('user_authenticated', 'true');
                localStorage.setItem('user_data', JSON.stringify(data));
                
                // ← DETENER LOADING ANTES DE NAVEGAR
                if (isMountedRef.current) {
                    setLoadingLogin(false);
                }
                
                // Navegar según perfil
                if (Number(perfil) === 3) {
                    console.log('👥 Navegando a patients');
                    history.push("/patients");
                } else {
                    console.log('📊 Navegando a dashboard');
                    history.push("/dashboard");
                }
                
                // Verificación adicional para asegurar navegación
                setTimeout(() => {
                    if (!isMountedRef.current) return; // ← VERIFICAR EN TIMEOUT
                    
                    const currentHash = window.location.hash;
                    if (currentHash.includes('login')) {
                        console.log('🔄 Forzando navegación...');
                        const targetRoute = Number(perfil) === 3 ? "/patients" : "/dashboard";
                        window.location.href = `${window.location.origin}${window.location.pathname}#${targetRoute}`;
                    }
                }, 1000);
                
                return; // ← SALIR TEMPRANO PARA EVITAR ACTUALIZAR LOADING
            }
        } catch (error) {
            console.error('❌ Error en login:', error);
        } finally {
            // ← SOLO ACTUALIZAR ESTADO SI EL COMPONENTE SIGUE MONTADO
            if (isMountedRef.current) {
                setLoadingLogin(false);
            }
        }
    };

    return (
        <>
            <VenCambioClave
                visible={showChangePasswordModal}
                onClose={() => {
                    if (isMountedRef.current) {
                        setShowChangePasswordModal(false);
                    }
                }}
            />
            <UnauthenticatedSessionControl storageTokenKey="token" />
            
            <div className="login-wrapper">
                <div className="login-card">
                    <div className="login-form-section">
                        <div className="logos-header">
                            <img
                                src={`${process.env.PUBLIC_URL}/images/logos/logoPavasStay.png`}
                                alt="Logo Cliente"
                                className="logo-cliente"
                            />
                        </div>

                        <div className="form-content">
                            {activeForm === "login" && (
                                <>
                                    <h2>Bienvenido de nuevo</h2>
                                    <p className="description">
                                        Inicia sesión y sigue creciendo con nosotros.
                                    </p>
                                    
                                    <LoginForm
                                        register={register}
                                        handleSubmit={handleSubmit}
                                        errors={errors}
                                        onLoginUser={onLoginUser}
                                        loading={loadingLogin}
                                        setActiveForm={(form) => {
                                            if (isMountedRef.current) {
                                                setActiveForm(form);
                                            }
                                        }}
                                    />
                                </>
                            )}

                            {activeForm === "recover" && (
                                <>
                                    <h2>Recuperar contraseña</h2>
                                    <VentanaRecuperar 
                                        onClose={() => {
                                            if (isMountedRef.current) {
                                                setActiveForm("login");
                                            }
                                        }} 
                                    />
                                </>
                            )}
                        </div>

                        <footer>
                            <div>© 2025 TODOS LOS DERECHOS RESERVADOS</div>
                            <img
                                src={`${process.env.PUBLIC_URL}/images/logos/logoPavasStay.png`}
                                alt="Desarrollado por"
                                className="logo-desarrollador-footer"
                            />
                        </footer>
                    </div>

                    <div className="login-image-section">
                        <div
                            className="image-inner"
                            style={{
                                width: "100%",
                                height: "100%",
                                backgroundImage: `url(${process.env.PUBLIC_URL}/images/bgDashboard.svg)`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                borderRadius: "16px",
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
