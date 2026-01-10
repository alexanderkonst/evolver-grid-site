import { CalendarDays } from "lucide-react";
import GameShell from "@/components/game/GameShell";

const EventsSpace = () => {
    return (
        <GameShell>
            <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <CalendarDays className="w-6 h-6 text-slate-700" />
                        <h1 className="text-2xl font-bold text-slate-900">Events</h1>
                    </div>
                    <p className="text-slate-600">Community gatherings and experiences</p>
                </div>

                {/* Coming Soon */}
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                    <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Events Coming Soon
                    </h3>
                    <p className="text-slate-600">
                        Community gatherings and experiences will be available here once the events system is set up.
                    </p>
                </div>
            </div>
        </GameShell>
    );
};

export default EventsSpace;
