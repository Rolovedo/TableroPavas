import React, { useState, forwardRef, useImperativeHandle, useContext } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { TabView, TabPanel } from "primereact/tabview";
import moment from "moment";
import PropTypes from "prop-types";
import Axios from "axios";
import Cookies from "js-cookie";

import { AuthContext } from "@context/auth/AuthContext";
import { ToastContext } from "@context/toast/ToastContext";
import { useMediaQueryContext } from "@context/mediaQuery/mediaQueryContext";
import { estados, headers } from "@utils/converAndConst";
import useHandleApiError from "@hook/useHandleApiError";
import GenericFormSection from "@components/data/GenericFormSection";
import PermisosTab from "./PermisosTab";

const defaultValues = {
    nombre: "",
    estid: 1,
    ventanas: [],
};

const VenPerfil = forwardRef(
    (
        {
            addItem,
            updateItem,
            setCurrentProfile,
            setDeleteDialogVisible,
            canAssignPermission,
            canDelete,
        },
        ref
    ) => {
        const { nombreusuario, idusuario } = useContext(AuthContext);
        const { isMobile, isTablet, isDesktop } = useMediaQueryContext();
        const { showSuccess, showInfo } = useContext(ToastContext);
        const handleApiError = useHandleApiError();

        const methods = useForm({ defaultValues });
        const { handleSubmit, reset, setValue, watch } = methods;

        const [visible, setVisible] = useState(false);
        const [prfId, setPrfId] = useState(0);
        const [activeTab, setActiveTab] = useState(0);
        const [loading, setLoading] = useState(false);
        const [originalData, setOriginalData] = useState({});
        const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
        const [ventanasDisponibles, setVentanasDisponibles] = useState([]);

        const getModules = async (id = 0) => {
            try {
                const { data } = await Axios.get("api/security/profiles/get_modules", {
                    params: { prfId: id },
                    headers: {
                        ...headers,
                        Authorization: `Bearer ${Cookies.get("tokenPONTO")}`,
                    },
                });

                const todas = [...data.asociados, ...data.sinasociar];

                const opciones = todas.map((v) => ({
                    nombre: v.descripcion,
                    id: v.venid.toString(),
                }));

                setVentanasDisponibles(opciones);

                const seleccionadas = data.asociados.map((v) => v.venid.toString());

                setValue("ventanas", seleccionadas);

                setOriginalData((prev) => ({
                    ...prev,
                    modulos: seleccionadas,
                }));
            } catch (error) {
                handleApiError(error);
            }
        };

        const newProfile = () => {
            reset(defaultValues);
            setPrfId(0);
            setOriginalData({});
            setPermisosSeleccionados([]);
            setVentanasDisponibles([]);
            setActiveTab(0);
            getModules(0);
            setVisible(true);
        };

        const editProfile = (data, tabIndex = 0) => {
            const { prfId, nombre, estid } = data;
            setPrfId(prfId);
            setValue("nombre", nombre);
            setValue("estid", estid);
            setPermisosSeleccionados([]);
            setActiveTab(tabIndex);
            setOriginalData(data);
            getModules(prfId);
            setVisible(true);
        };

        const saveProfile = async ({ nombre, estid, ventanas }) => {
            setLoading(true);

            const nuevas = (ventanas || []).map(Number).sort();
            const anteriores = (originalData.modulos || []).map(Number).sort();

            const sinCambios =
                prfId &&
                nombre === originalData.nombre &&
                estid === originalData.estid &&
                JSON.stringify(nuevas) === JSON.stringify(anteriores) &&
                permisosSeleccionados.length === 0;

            if (sinCambios) {
                setLoading(false);
                return showInfo("No has realizado ninguna modificación");
            }

            const params = {
                prfId,
                nombre,
                estid,
                modulos: nuevas,
                modulosant: anteriores,
                usuario: nombreusuario,
                idusuario,
            };

            try {
                const { data } = await Axios.post("api/security/profiles/save_profile", params, {
                    headers: {
                        ...headers,
                        Authorization: `Bearer ${Cookies.get("tokenPONTO")}`,
                    },
                });

                const finalPrfId = prfId || data.prfId;

                if (permisosSeleccionados.length > 0) {
                    await Axios.post(
                        "api/security/permissions/update_permissions_profile",
                        {
                            permissions: permisosSeleccionados.map((p) => p.perId),
                            prfId: finalPrfId,
                        },
                        {
                            headers: {
                                ...headers,
                                Authorization: `Bearer ${Cookies.get("tokenPONTO")}`,
                            },
                        }
                    );
                }

                showSuccess(data.message);

                const item = {
                    prfId: finalPrfId,
                    nombre,
                    estid,
                    nomestado: estid === 1 ? "Activo" : "Inactivo",
                    usuact: nombreusuario,
                    fecact: moment().format("YYYY-MM-DD HH:mm:ss"),
                };

                prfId ? updateItem({ idField: "prfId", ...item }) : addItem(item);

                reset(defaultValues);
                setPrfId(0);
                setVisible(false);
            } catch (error) {
                handleApiError(error);
            } finally {
                setLoading(false);
            }
        };

        const fieldsForm = [
            {
                key: "nombre",
                type: "text",
                name: "nombre",
                label: "Nombre del Perfil",
                validation: { required: "El campo nombre es requerido" },
                required: true,
                maxLength: 30,
                className: "col-12",
            },
            {
                key: "estado",
                type: "selectButton",
                name: "estid",
                label: "Estado",
                options: estados,
                className: "col-12",
            },
            {
                key: "ventanas_multiselect",
                type: "multiselect",
                name: "ventanas",
                label: "Seleccionar Ventanas",
                options: ventanasDisponibles,
                className: "col-12",
                multiple: true,
                validation: {
                    required: "Debe seleccionar al menos una ventana",
                },
                required: true,
            },
        ];

        useImperativeHandle(ref, () => ({
            newProfile,
            editProfile,
            onClose: () => setVisible(false),
        }));

        return (
            <Sidebar
                dismissable={true}
                visible={visible}
                position="right"
                className="p-sidebar-md"
                onHide={() => {
                    reset(defaultValues);
                    setPrfId(0);
                    setVisible(false);
                }}
                style={{ width: isMobile ? "100%" : isTablet ? 550 : isDesktop ? 450 : 450 }}
            >
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <h4 className="my-4 text-center" style={{ flex: 1, textAlign: "center" }}>
                            {prfId > 0 ? "Edición Perfil" : "Registro Perfil"}
                        </h4>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", padding: "0 1rem" }}>
                        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                            <TabPanel header="Información Básica">
                                <FormProvider {...methods}>
                                    <div style={{ marginTop: "10px", marginBottom: "50px" }}>
                                        <GenericFormSection fields={fieldsForm} />
                                    </div>
                                </FormProvider>
                            </TabPanel>

                            <TabPanel
                                header="Asignación Permisos"
                                disabled={!canAssignPermission || prfId === 0}
                            >
                                <PermisosTab
                                    prfId={prfId}
                                    opc={1}
                                    visible={visible}
                                    onPermisosChange={setPermisosSeleccionados}
                                />
                            </TabPanel>
                        </TabView>
                    </div>

                    <div
                        className="sidebar-footer"
                        style={{
                            flexShrink: 0,
                            padding: "1rem",
                            textAlign: "right",
                            borderTop: "1px solid #ccc",
                            background: "#fff",
                        }}
                    >
                        {canDelete && prfId > 0 && (
                            <Button
                                className="p-button-danger p-button-text"
                                onClick={() => {
                                    setCurrentProfile({ prfId, nombre: watch("nombre") });
                                    setDeleteDialogVisible(true);
                                }}
                                label={"Eliminar perfil"}
                                loading={loading}
                            />
                        )}
                        <Button
                            label={prfId ? "Guardar Cambios" : "Guardar"}
                            icon="pi pi-save"
                            className="p-button-info p-button-text ml-2"
                            onClick={handleSubmit(saveProfile)}
                            loading={loading}
                        />
                    </div>
                </div>
            </Sidebar>
        );
    }
);

VenPerfil.propTypes = {
    addItem: PropTypes.func.isRequired,
    updateItem: PropTypes.func.isRequired,
};

export default VenPerfil;
