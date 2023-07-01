import { Link } from "react-router-dom";
import { tableFiles } from "../../main";

function Mod() {
    return (
        <div>
            <h2>Table Files</h2>
            <ul>
                {Object.entries(tableFiles).map(([title, file]) => (
                    <li><Link to={file}>{title}</Link></li>
                ))}
            </ul>

            <h2>Misc.</h2>
            <ul>
                <li><Link to="items">All Items</Link></li>
                <li><Link to="shop">Shop Simulator</Link></li>
            </ul>
        </div>
    )
}

export default Mod;