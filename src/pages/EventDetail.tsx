import { Link } from "react-router-dom";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const EventDetail = () => {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center p-6">
                <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Events Coming Soon</h2>
                <p className="text-slate-600 mb-4">Event details will be available once events are set up.</p>
                <Button asChild variant="outline">
                    <Link to="/game/events">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Events
                    </Link>
                </Button>
            </div>
        </div>
    );
};

export default EventDetail;
