import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Ripple } from "primereact/ripple";
import { Badge } from "primereact/badge";
import { Link } from "react-router-dom";
import { AuthContext } from "@context/auth/AuthContext";
import "./styles/menu.css";

const AppSubmenu = ({ items, className, onMenuItemClick }) => {
    const onKeyDown = (event) => {
        if (event.code === "Enter" || event.code === "Space") {
            event.preventDefault();
            event.target.click();
        }
    };

    const renderLinkContent = (item) => (
        <div className="flex align-items-center justify-content-between w-full px-3 py-2">
            <div className="flex align-items-center gap-2">
                <i className={`${item.icon}`} />
                <span>{item.label}</span>
            </div>
            {item.badge !== undefined && (
                <Badge value={item.badge} severity="info" className="menu-item-badge" />
            )}
            <Ripple />
        </div>
    );


    const renderLink = (item) => {
        const handleClick = (e) => {
            if (typeof onMenuItemClick === "function") {
                onMenuItemClick({ originalEvent: e, item });
            }
        };

        return item.toa ? (
            <NavLink
                to={`/${item.toa}`}
                exact
                className="p-ripple"
                activeClassName="router-link-active router-link-exact-active"
                onKeyDown={onKeyDown}
                onClick={handleClick}
                target={item.target}
            >
                {renderLinkContent(item)}
            </NavLink>
        ) : (
            <a
                href={item.url}
                className="p-ripple"
                onKeyDown={onKeyDown}
                onClick={handleClick}
                target={item.target}
            >
                {renderLinkContent(item)}
            </a>
        );
    };

    return (
        <ul className={className} role="menu">
            {items.map((item, i) => (
                <li className="layout-menuitem-category" key={i}>
                    <div className="layout-menuitem-root-text" style={{ fontWeight: 700 }}>
                        {/* <i className={item.icon}></i> */}
                        <span>{item.label}</span>
                    </div>
                    {item.items && (
                        <ul className="layout-submenu-fixed" role="menu">
                            {item.items.map((child, j) => (
                                <li key={j}>{renderLink(child)}</li>
                            ))}
                        </ul>
                    )}
                </li>
            ))}
        </ul>
    );
};

export const AppMenu = (props) => {
    const { idusuario } = useContext(AuthContext);
    
    return (
        <div className="layout-menu-container">
            <div className="layout-logo-wrapper" style={{ marginBottom: "24px" }}>
                <Link to={idusuario ? "/dashboard" : "/"} className="layout-sidebar-logo">
                    {props.collapsed ? (
                        <span style={{ color: "white", fontSize: "24px", fontWeight: 200 }}>
                            MO
                        </span>
                    ) : (
                        <img
                            src={`${process.env.PUBLIC_URL}/images/logos/logoPavasStay.png`}
                            alt="Logo principal"
                            width={250}
                        />
                    )}
                </Link>
            </div>

            <AppSubmenu
                items={props.model}
                className="layout-menu"
                onMenuItemClick={props.onMenuItemClick}
                root={true}
                role="menu"
            />
        </div>
    );
};
