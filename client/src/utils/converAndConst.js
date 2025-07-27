import { getContrastingTextColor } from "@pages/auth/func/functions";

// CONSTANTES
export const headers = { "Content-Type": "application/json" };

export const nameSystem = "Gestión, proveedores y anticipos";

export const urlLogo = `${process.env.PUBLIC_URL}/images/logos/ponto.jpg`;

export const ruta = "";

export const getInitials = (fullName) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
    return (first + second).toUpperCase();
};

// URLs configurables por entorno
export const urlSocket = process.env.REACT_APP_SOCKET_URL || "https://tablero-pavas.vercel.app/";
export const urlbase = process.env.REACT_APP_BASE_URL || "https://tablero-pavas.vercel.app/";

export const pathSocket = "/socket.io/";

export const msnDatosObligatorios = "Hay información obligatoria por ingresar. Verificar";

export const appointmentsStatusColors = {
    1: { background: " #fde68a", color: "#7c4700", label: "POR CONFIRMAR" }, // Amarillo pastel
    2: { background: " #bbf7d0", color: "#065f46", label: "REPROGRAMADA" }, // Verde pastel
    3: { background: " #fecaca", color: "#3730a3", label: "CANCELADA" }, // Azul pastel
    4: { background: " #bbf7d0", color: "#991b1b", label: "CONFIRMADA" }, // Rojo pastel
    5: { background: " #e5e7eb", color: "#374151", label: "ASISTIÓ" }, // Gris pastel
    6: { background: " #fef9c3", color: "#a16207", label: "NO ASISTIÓ" }, // Amarillo claro pastel
    7: { background: " #fdf6b2", color: "#a16207", label: "POR REPROGRAMAR" }, // Amarillo muy claro pastel
};
export const daysOfWeek = [
    { label: "L", value: "monday", id: 1 },
    { label: "M", value: "tuesday", id: 2 },
    { label: "X", value: "wednesday", id: 3 },
    { label: "J", value: "thursday", id: 4 },
    { label: "V", value: "friday", id: 5 },
    { label: "S", value: "saturday", id: 6 },
    { label: "D", value: "sunday", id: 7 },
];

export const estados = [
    { nombre: "Activo", id: 1 },
    { nombre: "Inactivo", id: 2 },
];

export const prioridades = [
    { nombre: "Normal", id: 1 },
    { nombre: "Urgente", id: 2 },
];

export const checkStatus = [
    { nombre: "Bueno", id: 1 },
    { nombre: "Malo", id: 2 },
];

export const optionsSelect = [
    { nombre: "SI", id: 1 },
    { nombre: "NO", id: 0 },
];

export const optionsYesorNotSelect = [
    { nombre: "SI", id: 2 },
    { nombre: "NO", id: 1 },
];

export const optionsAccountTypeSelect = [
    { nombre: "Crédito", id: 3 },
    { nombre: "Corriente", id: 2 },
    { nombre: "Ahorros", id: 1 },
];

export const propsDataTable = {
    scrollable: true,
    paginator: true,
    lazy: true,
    size: "small",
    emptyMessage: "No se encontraron datos",
    paginatorTemplate:
        "CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown",
    currentPageReportTemplate: "{first} a {last} de {totalRecords}",
    rowsPerPageOptions: [5, 10, 20, 50],
};

export const propsPass = {
    weakLabel: "Debil",
    mediumLabel: "Media",
    strongLabel: "Alto",
};

export const propsSelectVS = {
    resetFilterOnHide: true,
    emptyMessage: "No Hay Datos",
    emptyFilterMessage: "No Hay Datos",
    optionLabel: "nombre",
    filterBy: "nombre",
    optionValue: "id",
    filter: true,
    showClear: true,
    virtualScrollerOptions: {
        emptyMessage: "No Hay Datos",
        itemSize: 38,
        lazy: false,
        showLoader: false,
        numToleratedItems: 2,
        delay: 0,
    },
    onShow: (e) => {
        const panel = document.querySelector(".p-dropdown-panel, .p-multiselect-panel");
        if (!panel) return;
        const scroller = panel.querySelector(".p-virtualscroller");
        const content = scroller?.querySelector(".p-virtualscroller-content");
        if (scroller && content) {
            scroller.scrollTop = 0;
            content.style.transform = "translateY(0px)";
        }
    },
    onFilter: (e) => {
        const panel = document.querySelector(".p-dropdown-panel, .p-multiselect-panel");
        if (!panel) return;
        const scroller = panel.querySelector(".p-virtualscroller");
        const content = scroller?.querySelector(".p-virtualscroller-content");
        if (scroller && content) {
            scroller.scrollTop = 0;
            content.style.transform = "translateY(0px)";
        }
    },
};

export const propsSelect = {
    resetFilterOnHide: true,
    emptyMessage: "No Hay Datos",
    emptyFilterMessage: "No Hay Datos",
    optionLabel: "nombre",
    filterBy: "nombre",
    optionValue: "id",
    filter: true,
    showClear: true,
};

export const propsSelectGeneric = {
    resetFilterOnHide: true,
    emptyMessage: "No Hay Datos",
    emptyFilterMessage: "No Hay Datos",
    filter: true,
    showClear: true,
};

export const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

export const propsSelectButton = {
    optionLabel: "nombre",
    optionValue: "id",
    unselectable: false,
};

export const propsCurrencyInput = {
    prefix: "$",
    decimalScale: 2,
    decimalsLimit: "10",
    decimalSeparator: ".",
    groupSeparator: ",",
    intlConfig: { locale: "en-US", currency: "USD" },
    className: "p-inputtext p-component text-right",
};

export const propsCalendar = {
    showButtonBar: true,
    showIcon: true,
    readOnlyInput: true,
    dateFormat: "yy-mm-dd",
    monthNavigator: "true",
    yearNavigator: "true",
    yearRange: "2000:2050",
};

export const brnl = (str, replaceMode) => {
    const replaceStr = replaceMode ? "\n" : "";
    return str !== null && str !== undefined && str !== ""
        ? str.replace(/<\s*\/?br\s*\/?>/gi, replaceStr)
        : "";
};

export const nlbr = (str, replaceMode, isXhtml) => {
    const breakTag = isXhtml ? "<br />" : "<br>";
    const replaceStr = replaceMode ? "$1" + breakTag : "$1" + breakTag + "$2";
    return (str + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, replaceStr);
};

export const strip_tags = (str, allow) => {
    allow = (((allow || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join("");

    const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    const commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return str.replace(commentsAndPhpTags, "").replace(tags, function ($0, $1) {
        return allow.indexOf("<" + $1.toLowerCase() + ">") > -1 ? $0 : "";
    });
};

export const stripslashes = (str) => {
    return str
        .replace(/\\'/g, "'")
        .replace(/"/g, '"') // Escapes innecesarios eliminados
        .replace(/\\\\/g, "\\")
        .replace(/\\0/g, "\0")
        .replace(/font-family:.+?;/i, ""); // Aquí el patrón se corrigió también
};

export function maskEmail(email) {
    const [localPart, domain] = email.split("@");
    if (localPart.length > 2) {
        const firstTwo = localPart.substring(0, 2);
        const lastTwo = localPart.substring(localPart.length - 2);
        return `${firstTwo}********${lastTwo}@${domain}`;
    } else {
        return `${localPart}@${domain}`; // Caso en que el nombre de usuario es muy corto
    }
}

export const decodeToken = (token) => {
    try {
        const base64Url = token.split(".")[1]; // Extraer la parte del payload
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(function (c) {
                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
        );

        return JSON.parse(jsonPayload); // Retorna el payload como objeto JSON
    } catch (error) {
        return null;
    }
};

export const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
    }
    return text;
};

// Diccionario para traducir meses de inglés a español
const monthTranslations = {
    January: "Enero",
    February: "Febrero",
    March: "Marzo",
    April: "Abril",
    May: "Mayo",
    June: "Junio",
    July: "Julio",
    August: "Agosto",
    September: "Septiembre",
    October: "Octubre",
    November: "Noviembre",
    December: "Diciembre",
};

// Función para traducir nombres de meses
export const translateMonths = (months) => {
    return months.map((monthYear) => {
        const [month, year] = monthYear.split(" "); // Separar mes y año
        const translatedMonth = monthTranslations[month] || month; // Traducir mes
        return `${translatedMonth} ${year}`; // Combinar mes traducido con el año
    });
};

export const CAPTCHA_SITE_KEY = process.env.REACT_APP_CAPTCHA_SITE_KEY;

export const rowClassNew = (rowData) => {
    const rawColor = rowData?.color ? rowData.color : "FFFFFF";
    const color = rawColor.startsWith("#") ? rawColor : `#${rawColor}`;
    const textColor = getContrastingTextColor(color);

    const className = `bg-color-${color.replace("#", "")}`;

    const styleSheet = document.styleSheets[0];

    const classExists = Array.from(styleSheet.cssRules).some(
        (rule) => rule.selectorText === `.${className}`
    );

    if (!classExists) {
        const cssRule = `
            .${className} {
                background-color: ${color} !important;
                color: ${textColor} !important;
            }
        `;
        styleSheet.insertRule(cssRule, styleSheet.cssRules.length);
    }

    return className;
};
