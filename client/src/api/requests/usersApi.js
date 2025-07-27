import Cookies from "js-cookie";
import httpCliente from "../services/httpCliente";
import axios from "axios";

const instance = axios.create();
instance.CancelToken = axios.CancelToken;
instance.isCancel = axios.isCancel;

export const getUsersApi = (params) => {
    return new Promise((resolve, reject) => {
        httpCliente
            .get(`api/security/users/get_users`, params)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getUserByPermisionAPI = (params) => {
    return new Promise((resolve, reject) => {
        httpCliente
            .post("api/security/users/get_users_permision", params)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getInstructorsAPI = (params) => {
    return new Promise((resolve, reject) => {
        httpCliente
            .post("api/security/users/get_instructors", params)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const countUsersAPI = (params) => {
    return new Promise((resolve, reject) => {
        httpCliente
            .get("api/security/users/count_users", params)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const paginationUsersAPI = (params) => {
    return new Promise((resolve, reject) => {
        httpCliente
            .post("api/security/users/list_users", params)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const deleteUserAPI = (params) => {
    return new Promise((resolve, reject) => {
        httpCliente
            .put("api/security/users/delete_user", params)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const saveUserAPI = (params) => {
    return new Promise((resolve, reject) => {
        httpCliente
            .post("api/security/users/save_user", params, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${Cookies.get("tokenPONTO")}`,
                },
            })
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const saveUserProfileAPI = (params) => {
    return new Promise((resolve, reject) => {
        httpCliente
            .post("api/security/users/save_user", params, {})
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const updateUserPhotoAPI = (params) => {
    return new Promise((resolve, reject) => {
        httpCliente
            .post("api/security/users/update_user_photo", params)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const updateUserPermissionsAPI = (params) => {
    return new Promise((resolve, reject) => {
        httpCliente
            .post("api/security/permissions/update_permissions_user", params)
            .then((response) => resolve(response))
            .catch((error) => reject(error));
    });
};

export const saveNewnessUserAPI = (params) => {
    return new Promise((resolve, reject) => {
        httpCliente
            .post("api/security/users/save_newness_user", params)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};
export const deleteNewnessUserAPI = (params) => {
    return new Promise((resolve, reject) => {
        httpCliente
            .post("api/security/users/delete_newness_user", params)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};
export const getNewnessUserAPI = (params) => {
    return new Promise((resolve, reject) => {
        httpCliente
            .post("api/security/users/get_newness_user", params)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};
