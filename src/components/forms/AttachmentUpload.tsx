export function AttachmentUpload() {
  // static preview only

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-border rounded p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Drag & drop files here, or click to browse
        </p>
        <input type="file" multiple className="mt-2" />
      </div>

      <div>
        <h4 className="text-sm font-medium">Files</h4>
        <div className="space-y-2 mt-2">
          {/* static preview example */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>example.pdf</div>
            <div>
              120 KB <button className="ml-2 text-red-400">Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttachmentUpload;
