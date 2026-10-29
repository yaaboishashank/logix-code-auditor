import { ArrowUpRight } from "lucide-react";
import Logo from "../../../../shared/ui/components/Logo";
import Button from "../../../../shared/ui/components/Button";
import { useWorkspaceEntry } from "../../context/LandingContext";
import { Link } from "react-router";
import useIsGuest from "../../../auth/hooks/useIsGuest";

const LandingHeader = () => {
    const openWorkspace = useWorkspaceEntry();

    const isGuest = useIsGuest();

    return (
        <header className="landing-header">
            <div className="landing-container landing-nav">
                <Logo />

                <nav className="landing-nav-links" aria-label="Main navigation">
                    <a href="#product">Why LOGIX</a>
                    <a href="#workflow">How it works</a>
                    <a href="#questions">FAQs</a>
                </nav>

                <div className="landing-nav-actions">
                    <Link to="/register" className="landing-nav-preview" data-start-free="true" hidden={!isGuest}>
                        Start free
                    </Link>

                    <Button
                        className="landing-workspace-link"
                        onClick={openWorkspace}
                    >
                        Workspace <ArrowUpRight aria-hidden="true" />
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default LandingHeader;