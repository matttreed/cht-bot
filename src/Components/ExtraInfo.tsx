
import React from "react";

const ExtraInfo = ({title, extra_info}: {title: string, extra_info: string}) => {

    const [clicked, setClicked] = React.useState(false);

    return (
        <div 
            onClick={() => setClicked(c => !c)}
            className={"mb-8 flex hover:pointer"}
        >
            <div className="text-lg rounded-2xl py-2 px-4 bg-blue-400 hover:bg-blue-500">
                <p className="">{title}</p>
                {clicked && 
                    <div>
                        <p className="">{extra_info}</p>
                    </div>
                }
            </div>
        </div>
    )
}

export default ExtraInfo;