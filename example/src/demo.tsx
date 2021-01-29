import { Props, c, useHost } from "atomico";

function component(props: Props<typeof component.props>) {
    const ref = useHost();
    return (
        <host shadowDom onSubmit={() => {}}>
            <h1>hola mundo,TSX</h1>
            <slot
                onslotchange={(event) => {
                    console.log(event.target);
                }}
            ></slot>
        </host>
    );
}

component.props = {
    age: Number,
};

customElements.define("my-wc", c(component));
