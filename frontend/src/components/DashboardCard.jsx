function DashboardCard({
    title,
    value,
    icon,
    color
}) {
    return (
        <div className="col-md-3 mb-4">

            <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center">

                        <div>

                            <p className="text-muted mb-1">
                                {title}
                            </p>

                            <h3 className="fw-bold">
                                {value}
                            </h3>

                        </div>

                        <div
                            className={`bg-${color} text-white rounded-circle d-flex justify-content-center align-items-center`}
                            style={{
                                width: "55px",
                                height: "55px"
                            }}
                        >
                            <i className={`bi ${icon} fs-4`}></i>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default DashboardCard;