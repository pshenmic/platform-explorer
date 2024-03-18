import "./ModalWindow.scss"

export default function ModalWindow({open, text, setShowModal}) {

    if (!open) {
        return <div></div>
    }

    return (
        <div className={"modal"}>
            <div className={"modal_container"}>
                <div className={"modal_message"}>
                    <div className={"modal_close"} onClick={() => setShowModal(false)}>X</div>
                    <span>{text}</span>
                </div>
            </div>
        </div>
    );
}
