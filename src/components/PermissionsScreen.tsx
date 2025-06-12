
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle, Smartphone } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionsScreenProps {
  onPermissionsGranted: () => void;
}

const PermissionsScreen = ({ onPermissionsGranted }: PermissionsScreenProps) => {
  const { permissions, requestPermissions, allPermissionsGranted } = usePermissions();

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (granted) {
      onPermissionsGranted();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-lg">
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <Smartphone className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold">VoiceAssist</h1>
              <p className="text-sm text-muted-foreground">
                Grant permissions to enable all features
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Required Permissions</span>
              </h3>

              {permissions.map((permission, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{permission.name}</p>
                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                  </div>
                  {permission.granted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleRequestPermissions}
                className="w-full h-12"
                disabled={allPermissionsGranted}
              >
                {allPermissionsGranted ? 'All Permissions Granted' : 'Grant Permissions'}
              </Button>

              {allPermissionsGranted && (
                <Button 
                  onClick={onPermissionsGranted}
                  variant="outline"
                  className="w-full h-12"
                >
                  Continue to App
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground text-center">
              <p>These permissions are required for:</p>
              <ul className="mt-1 space-y-1">
                <li>• Verifying WhatsApp numbers</li>
                <li>• Background text reading</li>
                <li>• System notifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PermissionsScreen;
