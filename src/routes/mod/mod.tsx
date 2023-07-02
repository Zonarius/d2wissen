import { Link, useParams } from "react-router-dom";
import { tableFiles } from "../../main";
import { entries } from "../../lib/util";

function Mod() {
    const { mod } = useParams();
    return (
        <div>
            <h2>Table Files</h2>
            <ul>
                {entries(tableFiles).map(([file, {title}]) => (
                    <li key={file}><Link to={file}>{title}</Link></li>
                ))}
            </ul>

            <h2>Misc.</h2>
            <ul>
                <li><Link to="items">All Items</Link></li>
                <li><Link to="shop">Shop Simulator</Link></li>
                { mod !== "projectd2" ? null :
                    <li><Link to="gheed">Gheed Helper</Link></li>
                }
            </ul>
        </div>
    )
}

export default Mod;