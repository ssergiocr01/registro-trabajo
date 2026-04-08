BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Tarea] (
    [id] INT NOT NULL IDENTITY(1,1),
    [titulo] NVARCHAR(255) NOT NULL,
    [descripcion] NVARCHAR(max) NOT NULL,
    [referencia] NVARCHAR(100),
    [fecha] DATETIME2 NOT NULL CONSTRAINT [Tarea_fecha_df] DEFAULT CURRENT_TIMESTAMP,
    [horas] FLOAT(53) NOT NULL CONSTRAINT [Tarea_horas_df] DEFAULT 0.5,
    [tipoId] INT NOT NULL,
    [deletedAt] DATETIME2,
    CONSTRAINT [Tarea_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TipoTarea] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(50) NOT NULL,
    CONSTRAINT [TipoTarea_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TipoTarea_nombre_key] UNIQUE NONCLUSTERED ([nombre])
);

-- AddForeignKey
ALTER TABLE [dbo].[Tarea] ADD CONSTRAINT [Tarea_tipoId_fkey] FOREIGN KEY ([tipoId]) REFERENCES [dbo].[TipoTarea]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
