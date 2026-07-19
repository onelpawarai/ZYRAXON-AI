import { S as Switch$1 } from "./LROKH5N7-Ca9_D61a.js";
import { l as splitProps, d as createComponent, q as mergeProps, S as Show } from "./main-D3v0Qciw.js";
function Switch(props) {
  const [local, others] = splitProps(props, ["children", "class", "hideLabel", "description"]);
  return createComponent(Switch$1, mergeProps(others, {
    get ["class"]() {
      return local.class;
    },
    "data-component": "switch",
    get children() {
      return [createComponent(Switch$1.Input, {
        "data-slot": "switch-input"
      }), createComponent(Show, {
        get when() {
          return local.children;
        },
        get children() {
          return createComponent(Switch$1.Label, {
            "data-slot": "switch-label",
            get classList() {
              return {
                "sr-only": local.hideLabel
              };
            },
            get children() {
              return local.children;
            }
          });
        }
      }), createComponent(Show, {
        get when() {
          return local.description;
        },
        get children() {
          return createComponent(Switch$1.Description, {
            "data-slot": "switch-description",
            get children() {
              return local.description;
            }
          });
        }
      }), createComponent(Switch$1.ErrorMessage, {
        "data-slot": "switch-error"
      }), createComponent(Switch$1.Control, {
        "data-slot": "switch-control",
        get children() {
          return createComponent(Switch$1.Thumb, {
            "data-slot": "switch-thumb"
          });
        }
      })];
    }
  }));
}
export {
  Switch as S
};
//# sourceMappingURL=switch-28fZ9wN6.js.map
